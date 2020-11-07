# hitmakers_radar 📡📻
![Deploy](https://github.com/roguib/hitmakers_radar/workflows/.github/workflows/deploy.yml/badge.svg)
![ts](https://badgen.net/badge/Built%20With/TypeScript/blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/cloudposse.svg?style=social&label=Follow%20%40hitmakers_radar)](https://twitter.com/hitmakers_radar/)

hitmakers_radar is a Twitter bot, built with TypeScript, that replies to mentions suggesting a random song from the music top charts of the last decade.

## Installation

Clone this repository into your local machine.

```
git clone https://github.com/roguib/hitmakers_radar.git
```

Change ```/src/config/environment.config.ts``` with the appropiate configuration parameters of your Twitter Account. Note that, in order to control your account using Twitter API, it has to have Developer privileges. You can learn more in the [official Twitter documentation](https://developer.twitter.com/en/apply-for-access).

```ts
export const CONFIG_OPTIONS = {
    twitter_api: {
        base_url: "https://api.twitter.com",
        token: "",
        consumer_key: "",
        consumer_secret: "",
        access_token_key: "",
        access_token_secret: ""
    },
    database: {
        url: 'mongo',
        port: '27017',
        auth: {
            user: '',
            password: ''
        }
    },
}
```

Start Docker Compose with the following command:

```
docker-compose up
```

By default, the bot will GET the replies every 15 minutes, to avoid being time-limited by Twitter. You can change this setting in ```src/app.ts```.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. We also have a [public project board](https://github.com/roguib/hitmakers_radar/projects/1) where you can find the project's backlog.

## License
[MIT](https://choosealicense.com/licenses/mit/)