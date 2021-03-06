import { oneLineTrim } from 'common-tags';
import { expectFileNotToExist, expectFileToMatch, writeFile } from '../../utils/fs';
import { ng } from '../../utils/process';
import { updateJsonFile } from '../../utils/project';

export default async function () {
  await updateJsonFile('tsconfig.json', configJson => {
    const compilerOptions = configJson['compilerOptions'];
    compilerOptions['target'] = 'es5';
  });

  await updateJsonFile('angular.json', workspaceJson => {
      const appArchitect = workspaceJson.projects['test-project'].architect;
      appArchitect.build.options.es5BrowserSupport = false;
  });

  await writeFile('browserslist', 'last 2 Chrome versions');
  await ng('build');
  await expectFileNotToExist('dist/test-project/polyfills-es5.js');
  await expectFileToMatch('dist/test-project/index.html', oneLineTrim`
    <script src="runtime.js"></script>
    <script src="polyfills.js"></script>
    <script src="styles.js"></script>
    <script src="vendor.js"></script>
    <script src="main.js"></script>
  `);

  await ng('build', `--es5BrowserSupport`);
  await expectFileToMatch('dist/test-project/polyfills-es5.js', 'core-js');
  await expectFileToMatch('dist/test-project/index.html', oneLineTrim`
    <script src="runtime.js"></script>
    <script src="polyfills-es5.js" nomodule></script>
    <script src="polyfills.js"></script>
    <script src="styles.js"></script>
    <script src="vendor.js"></script>
    <script src="main.js"></script>
  `);

  await updateJsonFile('angular.json', workspaceJson => {
    const appArchitect = workspaceJson.projects['test-project'].architect;
    appArchitect.build.options.es5BrowserSupport = undefined;
  });
  await writeFile('browserslist', 'IE 10');
  await ng('build');
  await expectFileToMatch('dist/test-project/polyfills-es5.js', 'core-js');
  await expectFileToMatch('dist/test-project/index.html', oneLineTrim`
    <script src="runtime.js"></script>
    <script src="polyfills-es5.js" nomodule></script>
    <script src="polyfills.js"></script>
    <script src="styles.js"></script>
    <script src="vendor.js"></script>
    <script src="main.js"></script>
  `);
}
