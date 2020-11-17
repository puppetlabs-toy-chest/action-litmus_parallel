"use strict";
const util = require('./util');

Object.defineProperty(exports, "__esModule", { value: true });
const core = util.__importStar(require("@actions/core"));

async function run() {
  try {
      let platform = core.getInput('platform');
      let agent_family = core.getInput('agent_family');
      let bundler_args = core.getInput('bundler_args');
      let additional_command = core.getInput('additional_command');
      let puppet_gem_version = core.getInput('puppet_gem_version');

      await util.wrappedExec('echo "PUPPET_GEM_VERSION=' + puppet_gem_version + '" >> $GITHUB_ENV');
      await util.wrappedExec('echo "CI=true" >> $GITHUB_ENV');

      console.log(`=== Install bundle ===`);
      await util.wrappedExec('gem --version');
      await util.wrappedExec('gem install --user-install bundler');
      //await util.wrappedExec('bundler -v');
      await util.wrappedExec(`bundle install --jobs 4 --retry 2 ${bundler_args}`);

      console.log(`=== Provision ===`);
      await util.wrappedExec(`bundle exec rake litmus:provision_list[${platform}]`);
      if (platform.match(/_deb/)) {
        await util.wrappedExec('bundle exec bolt command run "apt-get update && apt-get install wget --yes" --inventoryfile inventory.yaml --nodes ssh_nodes');
      }
      await util.wrappedExec(`bundle exec rake litmus:install_agent[${agent_family}]`);
      await util.wrappedExec('bundle exec rake litmus:install_module');

      if ( additional_command ) {
        await util.wrappedExec(additional_command);
      }

      console.log(`=== Run Acceptance Tests ===`);
      await util.wrappedExec(`bundle exec rake litmus:acceptance:parallel`);

      console.log(`=== Tear Down ===`);
      await util.wrappedExec(`bundle exec rake litmus:tear_down`);
  }
  catch (error) {
      console.log(`=== TESTING FAILED ===`)
      try  {
         if (process.env.DEBUG) {
           console.log(`=== Debug environment set, not running litmus:tear_down ===`)
	 } else {
           console.log(`=== Tear Down ===`);
           await util.wrappedExec(`bundle exec rake litmus:tear_down`);
         }
      }
      catch(tear_error) {
        core.setFailed(tear_error.message);
      }
      core.setFailed(error.message);
  }
}
run();
