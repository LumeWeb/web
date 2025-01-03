#!/bin/bash

APPS="@lumeweb/portal-dashboard,@lumeweb/portal-admin,@lumeweb/portal-frontend"
modified_apps=()
module_versions=()

# Clear the modified apps file
> /tmp/modified_apps.txt
> /tmp/module_versions.txt

for app in $(echo $APPS | tr ',' ' ')
do
  echo "Processing $app"
  latest_release=$(git describe --tags --match "$app@*" --abbrev=0 2>/dev/null)
  if [ -z "$latest_release" ]
  then
    echo "Latest release for $app does not exist, skipping"
    continue
  fi

  echo "Latest release: $latest_release"
  version=$(echo $latest_release | cut -d "@" -f 3)
  APP_NAME=$(echo $app | cut -d "/" -f 2)

  # Build and export the app
  echo "Building and exporting app"
  pnpm run build:$APP_NAME

  # Set up the build directory
  mkdir -p go/$APP_NAME/build

  # Determine which output directory exists
  OUTPUT_DIR=""
  if [ -d "apps/$APP_NAME/build/client" ]; then
    OUTPUT_DIR="apps/$APP_NAME/build/client"
  elif [ -d "apps/$APP_NAME/dist" ]; then
    OUTPUT_DIR="apps/$APP_NAME/dist"
  else
    echo "No client build output found for $APP_NAME"
    continue
  fi

  # Check if there are actual differences before copying
  if ! diff -r "$OUTPUT_DIR" go/$APP_NAME/build/ > /dev/null 2>&1; then
    echo "Changes detected in $APP_NAME build output"
    # Remove old files and copy new ones
    rm -rf go/$APP_NAME/build/*
    cp -R "$OUTPUT_DIR"/* go/$APP_NAME/build/

    # Track modified app and its version
    modified_apps+=("$APP_NAME")
    module_versions+=("$version")
    echo "$APP_NAME" >> /tmp/modified_apps.txt
    echo "$version" >> /tmp/module_versions.txt
  else
    echo "No changes detected in $APP_NAME build output"
  fi
done

echo ""

if [ ${#modified_apps[@]} -gt 0 ]
then
  echo "Modified apps: ${modified_apps[*]}"

  # Targeted git add for each modified app
  for app in "${modified_apps[@]}"
  do
    git add go/$app/build
  done

  # Create a detailed commit message with versions
  commit_msg="chore: export app builds for"
  for i in "${!modified_apps[@]}"; do
    commit_msg+=" ${modified_apps[$i]}@${module_versions[$i]}"
  done

  git commit -m "$commit_msg"
fi
