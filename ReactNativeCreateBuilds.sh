#!/bin/bash

echo What is the name of the release?

read releaseName

npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

rm android/app/src/main/res/drawable-hdpi/node_modules_*
rm android/app/src/main/res/drawable-mdpi/node_modules_*
rm android/app/src/main/res/drawable-xhdpi/node_modules_*
rm android/app/src/main/res/drawable-xxhdpi/node_modules_*
rm android/app/src/main/res/drawable-xxxhdpi/node_modules_*

cd android/
./gradlew assembleRelease

cp app/build/outputs/apk/release/app-release.apk app/release/$releaseName.apk

cd ../ios/

var=$(PWD)

xcodebuild -workspace $var/who_mobile.xcworkspace -scheme ReleaseScheme archive

exit