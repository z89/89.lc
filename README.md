# 89.lc

a url shortener & ip logger made using next.js 14. Built to be minimalistic, it uses a nextjs backend API to handle the routing & creation of shortened urls. The urls are stored using a durable redis cache for performance (using the vercel kv service). Each shortened url is deterministic by using the SHA256 hashing algorithm provided by the nodejs crypto library.

## Contributing

pull requests are welcome to:

- revise the docs
- fix bugs or bad logic
- suggest/add features or improvements

## License

MIT
