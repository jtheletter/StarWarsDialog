# twitter dialog bot

A bot to tweet written works line by line in order.

## Code Dependencies:

- [NPM Twit](https://www.npmjs.com/package/twit) for Twitter authentication and posting.
- [NPM AWS-SDK](https://www.npmjs.com/package/aws-sdk) for index storage and retrieval.
- [AWS CLI](https://docs.aws.amazon.com/cli/index.html) for CLI deployment. Installed globally and directly from Amazon. Version 2 (latest) used.

## Platform Dependencies:

- [Twitter](https://twitter.com/).
- [Twitter Developer Platform](https://developer.twitter.com/en/docs/basics/apps/overview).
- [AWS IAM](https://aws.amazon.com/iam/) for lambda access.
- [AWS Systems Manager (SSM)](https://aws.amazon.com/systems-manager/) for index storage.
- [AWS Lambda](https://aws.amazon.com/lambda/) for code storage and execution.
- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) for scheduling and logs.

## History:

- This bot initially served only one written work.
- It was first written for [Heroku](https://www.heroku.com/). Heroku reboots worker dynos every 24 hours, which reset the index to zero and prevented the sequence of tweets from continuing in order.
- It was next adjusted to run on [AWS EC2](https://aws.amazon.com/ec2/). This proved more expensive than desired.
- It was then configured to run on AWS Lambda, with its index saved in AWS Systems Manager (SSM)’s Parameter Store.
- Finally, the bot can now serve multiple works.

## Instructions:

### For all written works:

- Install AWS CLI. Access keys are stored in `~/.aws/credentials`.
- Create a Twitter dev app.
- Create an AWS account.
- Create an AWS IAM role.
  - Set type to AWS service.
  - Set use case to lambda.
  - Set permissions to Lambda Full Access and SSM Full Access.

### For each written work:

- Save the work’s lines to the `lines` directory, and add its name to the `works.js` list.
- Create a Twitter account.
- Generate tokens/keys to authorize the Twitter app to post to the Twitter account ([here](https://medium.com/geekculture/how-to-create-multiple-bots-with-a-single-twitter-developer-account-529eaba6a576) is one way to do so). Save to `config/twitter/<work>/dev.js`.
- Create an AWS SSM Parameter Store named `/<work>/index` with string/text value `0`. Save its region in `config/aws/<work>/`.
- Create an AWS lambda function.
  - Author from scratch.
  - Set the function name to the work’s name.
  - Change the default execution role to the IAM role.
  - Configure general timeout to six seconds (each execution gets an index from AWS, posts text to Twitter, and saves a new index to AWS; together this averages three seconds in CloudWatch).
  - Configure environmental variables:
      - Add `NODE_ENV` as `production`.
      - Add `WORK` as the work’s name.
      - Add per Twitter config:
        - `ACCESS_TOKEN` (work bot’s oauth_token).
        - `ACCESS_TOKEN_SECRET` (work bot’s oauth_token_secret).
        - `CONSUMER_KEY` (dev app’s API Key).
        - `CONSUMER_SECRET` (dev app’s API Secret Key).
- Create an AWS CloudWatch event rule.
  - Schedule a fixed rate to the desired minutes.
  - Add the corresponding lambda as its target.
  - Name it the same as the work.
  - Toggle its state to enabled when ready to begin automated executions.
  - NB: AWS will not execute upon enablement during creation, but it will execute upon enablement after creation or upon saving edits to the rule.
- View logs in AWS CloudWatch.
- Command-line scripts:
    - Check lines meet Twitter limits: `WORK=<work> npm run check-lines`
    - Confirm Twitter credentials: `WORK=<work> npm run confirm-twitter`
    - Get index from AWS storage: `WORK=<work> npm run get-index`
    - Set index in AWS storage: `WORK=<work> npm run set-index <index>`
    - Zip code for deploy: `npm run zip`
    - Deploy the zip (increase timeout in script if needed): `WORK=<work> npm run deploy`
    - Execute handler manually: `WORK=<work> npm run execute`
