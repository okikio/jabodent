FROM gitpod/workspace-full

USER root
RUN bash -c ". .nvm/nvm.sh && nvm install v14 --reinstall-packages-from=node && nvm alias default v14 && nvm use default" 

USER gitpod
# Install custom tools, runtime, etc. using apt-get
# For example, the command below would install "bastet" - a command line tetris clone:
#
# RUN sudo apt-get -q update && #     sudo apt-get install -yq bastet && #     sudo rm -rf /var/lib/apt/lists/*
#
# More information: https://www.gitpod.io/docs/config-docker/
