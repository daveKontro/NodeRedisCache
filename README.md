# NodeRedisCache
launch a redis server via node.js

# Description
in this example redis is used as a in-memory data store... user data is stored outside of the redis server, when a request for user data is made to the redis server the server fetches it from a data source and holds that info in memory via redis, when a subsequent request is made the info can be retrieved from the redis cache rather than the original data source, which in this case is 2 orders of magnitude faster... the cached data is set to expire every hour to keep it fresh