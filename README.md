<p align="center">
    <img src="docs/logo.png" alt="rss-to-telegram" width="100">
</p>

<p align="center">
    Telegram RSS bot designed to deliver news in concise summaries and lets you translate them into your preferred language.
</p>

## Description

As not everyone RSS feeds provides shortened descriptions, this bot allows users to read news in concise summaries. Additionally, it empowers users with the option to translate these summaries into their language of choice.

For those who prefer immediate access without the need to deploy the bot themselves, it's available on Telegram. No need to set up yourself. Simply click the link and follow the provided instructions to get started - https://t.me/ai_rss_to_telegram_bot

The following features are available:

- Adding up to 10 RSS feeds per user account.
- Shortening articles into concise summaries.
- Translating news into multiple languages: English, French, Italian, Russian, German, Portuguese, Spanish, Japanese, Chinese.
- Posting news from RSS feeds to private/public channel groups.
- The message layout includes an image, title, news summary, and a link to the source site (format is fixed).

## Getting started

### Setting Up a Telegram Bot

To set up a new Telegram bot:

1. Go to [@BotFather](https://t.me/BotFather).
2. Click the Menu button and choose `/newbot` command.
3. Follow the instructions to create your bot.

After creation, you'll receive an API Token. Save this token in a `.env` file as `TELEGRAM_BOT_TOKEN`.

### Setting Up an OpenAI Project

To set up your OpenAI project, follow these steps:

1. Visit OpenAI and log in or register.
2. Click on "Create project" to start a new project.
3. Navigate to your profile and select "User API keys".
4. Click on "Create new secret key".
5. Save the secret key in a `.env` file as `OPENAI_API_KEY`.

### Configuring a MongoDB Atlas Database

For setting up your MongoDB Atlas cloud database, please follow the instructions below:

1. Navigate to MongoDB Atlas and either sign in or create a new account.
2. Create a new Organization.
3. Within the Organization, start a new Project.
4. In the Project, proceed to create a new Cluster.
5. In the Cluster section, access Collections and select the option to Create Database.
6. Once Cluster and Database is created, select the Connect button, click on Choose a connection method as MongoDB for VS Code and follow the instructions under "Connect to your MongoDB deployment".
7. Retrieve the connection string that begins with `mongodb+srv://`. Ensure the string ends with `/<database_name>?retryWrites=true&w=majority&appName=<cluster_name>`.
8. Save this connection string in a `.env` file labeled as `DATABASE_URL`.

### Creating EC2 IAM Instance Profile

1. Go to AWS Management Console.
2. Search for IAM and click the IAM Service.
3. Click **Roles** under **Access Management** in the left sidebar.
4. Click the **Create role** button.
5. Select **AWS Service** under **Trusted entity type**. Then select **EC2** under **common use cases** and click **Next**.
6. Search for **AWSElasticBeanstalk** and select the **AWSElasticBeanstalkWebTier**, **AWSElasticBeanstalkWorkerTier** and **AWSElasticBeanstalkMulticontainerDocker** policies. Click the **Next** button.
7. Give the role the name of **aws-elasticbeanstalk-ec2-role**
8. Click the Create role button.
9. Choose the instance you've set up and copy its **Public IPv4 address**.
10. In MongoDB Atlas, go to your project, proceed to **Network Access**, and whitelist the copied IP address to enable cluster connections.

### Creating IAM User

1. Search for **IAM**.
2. Click **Create Individual IAM Users** and click **Manage Users**.
3. Click **Add User**.
4. Enter any name you’d like in the **User Name** field.
5. Click **Next**.
6. Click **Attach Policies Directly**.
7. Use the search bar to find and tick the box next to **AdministratorAccess-AWSElasticBeanstalk**.
8. Click **Next**.
9. Click **Create user**.
10. Select the IAM user that was just created from the list of users.
11. Click **Security Credentials**.
12. Scroll down to find **Access Keys**.
13. Click **Create access key**.
14. Select **Command Line Interface (CLI)**.
15. Scroll down and tick the **I understand...** check box and click **Next**.
16. Copy and/or download the Access Key ID and Secret Access Key to use for deployment.

### Creating the Elastic Beanstalk Environment

1. Go to AWS Management Console
2. Search for **Elastic Beanstalk** and click the Elastic Beanstalk service.
3. Click the **Create environment** button.
4. You will need to provide an **Application name**, which will auto-populate an **Environment name**.
5. Scroll down to find the **Platform** section. You will need to select the Platform of **Docker**. This will auto-select several default options.
6. Scroll down to the **Presets** section and make sure that **free tier eligible** has been selected.
7. Click the **Next** button to move to Step #2.
8. You will be taken to a Service Access configuration form.
   Ensure that **Use an existing service role** is selected and that the service role created in Section 7 is listed. This should also auto-populate the EC2 instance profile with the ec2-role that was previously created.
9. Click the **Skip to Review** button.
10. Click the **Submit** button and wait for your new Elastic Beanstalk application and environment to be created and launch.

### S3 Bucket Configuration

After you have created an Elastic Beanstalk environment, you will need to modify the S3 bucket.

1. Go to AWS Management Console
2. Search for **S3** and click the S3 service.
3. Find and click the **elasticbeanstalk** bucket that was automatically created with your environment.
4. Click **Permissions** menu tab.
5. Find **Object Ownership** and click **Edit**
6. Change from **ACLs disabled** to **ACLs enabled**. Change **Bucket owner Preferred** to **Object Writer**. Check the box acknowledging the warning.
7. Click Save changes.

### Creating ElastiCache Redis

1. Go to AWS Management Console and use Find Services to search for ElastiCache.
2. In the sidebar under Resources, click **Redis OSS caches**.
3. Click the **Create Redis OSS caches** button.
4. Select **Design your own cache** and **Cluster cache**
5. Make sure Cluster Mode is DISABLED.
6. Scroll down to Cluster info and set Name to **multi-docker-redis**.
7. Scroll down to Cluster settings and change Node type to **cache.t3.micro**.
8. Change Number of Replicas to 0 (Ignore the warning about Multi-AZ).
9. Scroll down to Subnet group. Select **Create a new subnet group** if not already selected.
10. Enter a name for the Subnet Group such as **redis**.
11. Scroll down and click the Next button.
12. Scroll down and click the Next button again.
13. Scroll down and click the Create button.

### Creating a Custom Security Group

1. Go to AWS Management Console and use Find Services to search for VPC.
2. Find the Security section in the left sidebar and click **Security Groups**.
3. Click the **Create Security Group** button.
4. Set Security group name to **multi-docker**.
5. Set Description to **multi-docker**.
6. Make sure VPC is set to your default VPC.
7. Scroll down and click the **Create Security Group** button.
8. After the security group has been created, find the **Edit inbound rules** button.
9. Click **Add Rule**.
10. Set Port Range to **6379**.
11. Click in the box next to Source and start typing 'sg' into the box. Select the Security Group you just created.
12. Click the **Save** rules button.

### Applying Security Groups to Elastic Beanstalk

1. Go to the AWS Management Console and use Find Services to search for Elastic Beanstalk.
2. Click **Environments** in the left sidebar.
3. Click **app-name-env**.
4. Click **Configuration**.
5. In the Instances row, click the **Edit** button.
6. Scroll down to EC2 Security Groups and tick the box next to **multi-docker**.
7. Click **Apply** and then click **Confirm**.
8. After all the instances restart and transition from No Data to Severe, you should see a green checkmark under Health.

### Applying Security Groups to ElastiCache

1. Go to the AWS Management Console and use Find Services to search for ElastiCache.
2. Under Resources, click **Redis clusters** in the Sidebar.
3. Check the box next to your Redis cluster.
4. Click **Actions** and then click **Modify**.
5. Scroll down to find Selected security groups and click **Manage**.
6. Tick the box next to the new multi-docker group and click **Choose**.
7. Scroll down and click **Preview Changes**.
8. Click the **Modify** button.

### AWS Keys in Github Actions

1. Go to your Github account and find the project repository for the application you are working on.
2. On the repository page, click on **Settings**.
3. Go to **Security** section and select **Secrets and variables** and then click on **Actions**.
4. Create an `AWS_ACCESS_KEY` secret and paste your IAM access key.
5. Create an `AWS_SECRET_KEY` secret and paste your IAM secret key.
6. Create an `AWS_APP_NAME` secret and paste your Elastic Beanstalk Application name.
7. Create an `AWS_BUCKET_NAME` secret and paste your S3 bucket name.
8. Create an `AWS_REGION` secret and paste AWS region from S3 bucket.
9. Create an `DOCKER_PASSWORD` secret and paste generated **Personal access token**. To create a new token, go to your Docker account, select **Account settings**, choose **Personal access tokens**, and then select **Generate new token**.
10. Create an `DOCKER_USERNAME` secret and paste your Docker username.

### Setting Environment Variables

1. Go to AWS Management Console and use Find Services to search for Elastic Beanstalk.
2. Click **Environments** in the left sidebar.
3. Click **app-name-env**.
4. In the left sidebar click **Configuration**.
5. Scroll down to the Updates, monitoring, and logging section and click **Edit**.
6. Scroll down to the Environment Properties section. Click Add environment property.
7. In another tab, open up **ElastiCache**, click **Redis**, and check the box next to your cluster. Find the Primary Endpoint and copy that value but omit the **:6379**.
8. Set `REDIS_HOST` key to the primary endpoint listed above, remember to omit **:6379**.
9. Set `REDIS_PORT` key to **6379**.
10. Set values for `DATABASE_URL`, `OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `PORT` environments properties.
11. Click **Apply** button.
12. After all instances restart and go from No Data, to Severe, you should see a green checkmark under Health.

### Deploying App

1. Make a small change to your project root file and then run in your terminal:

   ```bash
   git add.
   git commit -m “testing deployment"
   git push origin master
   ```

2. Go to your **Github Actions** section and check the status of your build.
3. The status should eventually return with a green checkmark and show "build passing"
4. Go to your AWS Elastic Beanstalk application
5. It should say "Elastic Beanstalk is updating your environment"
6. It should eventually show a green checkmark under "Health". You will now be able to access your application at the external URL provided under the environment name.
