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
RUN npm test
