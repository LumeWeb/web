#!/bin/bash

# Based off https://github.com/SiaFoundation/web/blob/6c7e3681853d7101d34b7f11c246fafd11dea275/scripts/release-go.sh

APPS="@lumeweb/portal-dashboard,@lumeweb/portal-admin"
declare -a go_releases
declare -a modified_apps

for app in $(echo $APPS | tr ',' ' ')
do
  echo "$app"
  latest_release=$(git describe --tags --match "$app@*" --abbrev=0 2>/dev/null)
  if [ -z "$latest_release" ]
  then
    echo "Latest release for $app does not exist"
  else
    echo "Latest release: $latest_release"
    APP_NAME=$(echo $app | cut -d "/" -f 2)
    version=$(echo $latest_release | cut -d "@" -f 3)
    go_release="v$version-$APP_NAME-go"
    tag=$(git describe --exact-match "$go_release" 2>/dev/null)
    if [ -z "$tag" ]
    then
      echo "Tag $go_release does not exist, building and exporting app"
      pnpm run build:$APP_NAME
      mkdir -p go/$APP_NAME/build
      rm -rf go/$APP_NAME/build/*
      cp -R apps/$APP_NAME/build/client/* go/$APP_NAME/build/

      go_releases+=("$go_release")
      modified_apps+=("$APP_NAME")
    else
      echo "Tag $go_release exists"
    fi
  fi
done

echo ""

if [ ${#go_releases[@]} -gt 0 ]
then
  echo "Releasing: ${go_releases[*]}"

  # First commit the build files
  for app in "${modified_apps[@]}"
  do
    git add go/$app/build
  done
  git commit -m "chore: export ${go_releases[*]}"

  # Now create the subtree splits and tags
  for i in "${!modified_apps[@]}"
  do
    app="${modified_apps[$i]}"
    release="${go_releases[$i]}"
    echo "Creating tag $release for $app"

    # Create subtree split
    git subtree split --prefix=go/$app -b "temp-$app"

    # Create tag
    git tag -a "$release" "temp-$app" -m "Go module $release"

    # Clean up
    git branch -D "temp-$app"
  done
fi
