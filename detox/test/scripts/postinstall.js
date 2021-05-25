const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');

const rnVersion = function() {
  const rnPackageJson = require('react-native/package.json');
  return rnPackageJson.version;
}();

function patchHermesLocationForRN60Android() {
  const HERMES_PATH_ROOT = path.join('node_modules', 'hermesvm');
  const HERMES_PATH_RN = path.join('node_modules', 'react-native', 'node_modules', 'hermesvm');

  const hermesIsInRoot = fs.existsSync(HERMES_PATH_ROOT);
  const hermesIsInRN = fs.existsSync(HERMES_PATH_RN);

  if (hermesIsInRoot && !hermesIsInRN) {
    console.log('  Applying hermes-vm patch for RN .60...');
    fs.ensureDirSync(path.join(HERMES_PATH_RN, 'android'));
    fs.copySync(path.join(HERMES_PATH_ROOT, 'android'), path.join(HERMES_PATH_RN, 'android'));
  } else {
    console.log('  Skipping hermes-vm patching (not needed):', hermesIsInRoot, hermesIsInRN);
  }
}

function overrideReactAndroidGradleForRn64Android() {
  const REACT_ANDROID_PATH = path.join('node_modules', 'react-native', 'ReactAndroid');
  const REACT_ANDROID_GRADLE_SCRIPT_PATH = path.join(REACT_ANDROID_PATH, 'build.gradle');
  const REACT_ANDROID_GRADLE_BAK_SCRIPT_PATH = path.join(REACT_ANDROID_PATH, 'build.gradle.bak');
  const PATCH_SCRIPT_PATH = path.join('scripts', 'ReactAndroid_rn64_build.gradle');

  console.log('  Overriding ReactAndroid\'s build.gradle...');
  try {
    fs.renameSync(REACT_ANDROID_GRADLE_SCRIPT_PATH, REACT_ANDROID_GRADLE_BAK_SCRIPT_PATH);
  } catch (e) {
    console.warn(  'Couldn\'t create a backup to original script (skipping)');
  }
  fs.copySync(PATCH_SCRIPT_PATH, REACT_ANDROID_GRADLE_SCRIPT_PATH);
}

function run() {
  console.log('Running Detox test-app post-install script...');

  if (semver.minor(rnVersion) === 60) {
    console.log('  Detected RN version .60! Applying necessary patches...')
    patchHermesLocationForRN60Android();
  }

  if (semver.minor(rnVersion) === 64) {
    console.log('  Detected RN version .64! Applying necessary patches...')
    overrideReactAndroidGradleForRn64Android();
  }

  console.log('Detox test-app post-install script completed!');
}

run();
