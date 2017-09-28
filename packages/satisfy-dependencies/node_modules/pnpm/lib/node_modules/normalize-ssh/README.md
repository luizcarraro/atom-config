# normalize-ssh

> Normalize a SSH URL

[![npm version](https://img.shields.io/npm/v/normalize-ssh.svg)](https://www.npmjs.com/package/normalize-ssh) [![Build Status](https://img.shields.io/travis/zkochan/normalize-ssh/master.svg)](https://travis-ci.org/zkochan/normalize-ssh)

## Installation

```
npm i -S normalize-ssh
```

## Usage

```js
const normalizeSshUrl = require('normalize-ssh')

normalizeSshUrl('git@gitlab.domain.tld:myproject/myrepo.git')
//> ssh://git@gitlab.domain.tld:22/myproject/myrepo.git
```

## License

[MIT](LICENSE) © [Zoltan Kochan](http://kochan.io)
