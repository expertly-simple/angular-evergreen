FROM circleci/node:lts-browsers

WORKDIR /home/circleci

# RUN mkdir -p /usr/repo/app

# RUN chown circleci: /usr/repo/app

ADD package.json .
ADD package-lock.json .

ADD src src
ADD resources resources

ADD .nycrc .
ADD .prettierrc .
ADD tsconfig.json .
ADD tslint.json .
ADD webpack.config.js .

RUN npm ci

# RUN sudo chown root /home/circleci/.vscode-test/vscode-1.40.0/VSCode-linux-x64/chrome-sandbox
# RUN chmod 4755 /home/circleci/.vscode-test/vscode-1.40.0/VSCode-linux-x64/chrome-sandbox

RUN npm run pretest
RUN npm run test:mocha
