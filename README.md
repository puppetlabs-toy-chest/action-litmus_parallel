# Notice of no maintainership

This action is not further maintained. If you want to run litmus on Github Actions, please check out [the PDK templates](https://github.com/puppetlabs/pdk-templates/tree/main/moduleroot/.github/workflows).

# Action Litmus-Parallel

This action was designed to allow running acceptance tests for Puppet modules using Litmus. 
This will allow you to set up a matrix strategy in your Github Actions workflow to run the module's acceptance tests on multiple platforms and Puppet agent versions.

## Getting Started

In the following example you can see the jobs setup in a Github Actions workflow that runs the acceptance tests using Litmus for a module using Puppet agent versions 5 and 6 and platform array specified in the provision.yaml of the module, in this example the platforms specified in the release_checks are used. For more information about the provision.yaml and Litmus see the documentation [here](https://github.com/puppetlabs/puppet_litmus/wiki). 

> provisin.yaml

    ---
    release_checks:
      provisioner: docker
      images: ['litmusimage/ubuntu:14.04', 'litmusimage/ubuntu:16.04', 'litmusimage/ubuntu:18.04']

> .github/workflows/example_workflow.yaml

    ...
    jobs:
      LitmusAcceptance:
        runs-on: self-hosted
    
        strategy:
          matrix:
            ruby_version: [2.5.x]
            puppet_gem_version: [~> 6.0]
            platform: [release_checks]
            agent_family: ['puppet5', 'puppet6']
    
        steps:
        - uses: actions/checkout@v1
    
        - name: Litmus Parallel
          uses: puppetlabs/action-litmus_parallel@main
          with:
            platform: ${{ matrix.platform }}
            agent_family: ${{ matrix.agent_family }}

