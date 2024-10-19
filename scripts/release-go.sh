#!/bin/bash

# Based off https://github.com/SiaFoundation/web/blob/6c7e3681853d7101d34b7f11c246fafd11dea275/scripts/release-go.sh

APPS="@lumeweb/portal-dashboard,@lumeweb/portal-admin"
go_releases=()
modified_apps=()

for app in $(echo $APPS | tr ',' ' ')
do
  echo "$app"
  latest_release=$(git describe --tags --match "$app@*" --abbrev=0 2>/dev/null)
  if [ -z "$latest_release" ]
  then
    echo "Latest release for $app does not exist"
  else
    echo "Latest release: $latest_release"
    version=$(echo $latest_release | cut -d "@" -f 3)
    go_release="$app/$version-go"
    tag=$(git describe --exact-match "$go_release" 2>/dev/null)
    if [ -z "$tag" ]
    then
      echo "Tag $go_release does not exist, building and exporting app"
      APP_NAME=$(echo $app | cut -d "/" -f 2)
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

  # Targeted git add for each modified app
  for app in "${modified_apps[@]}"
  do
    git add go/$app/build
  done

  git commit -m "chore: export ${go_releases[*]}"
  for tag in "${go_releases[@]}"
  do
    git tag -a $tag -m "Go module $tag"
  done
fi
