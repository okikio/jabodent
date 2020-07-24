FROM gitpod/workspace-full
                    
USER gitpod
RUN bash -c ". .nvm/nvm.sh \
    && nvm install v14 && nvm alias default v14 && nvm use default" \
# Install custom tools, runtime, etc. using apt-get
# For example, the command below would install "bastet" - a command line tetris clone:
#
# RUN sudo apt-get -q update && #     sudo apt-get install -yq bastet && #     sudo rm -rf /var/lib/apt/lists/*
#
# More information: https://www.gitpod.io/docs/config-docker/
