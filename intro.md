_intro to redis: redis-server and redis-cli_

## general

[setup redis-server](https://redis.io/topics/quickstart)

- run
  - cd <dir_of_interest>
  - redis-server
  - redis-cli

## some basic commands

[list of all commands](https://redis.io/commands)

- QUIT: close cli connection
- SHUTDOWN: persists data and shuts down redis server
  - run from cli then QUIT
- SET: set key value
  - SET greeting "hello world"
  - SET foo:bar "baz"
- GET: get key value
- KEYS *: get all keys
- TYPE: get key type
- APPEND: add to end of existing key's value
- MSET: set multiple key value pairs
  - MSET keyOne 1 keyTwo 2
- INCR: increment a number value by 1
- DECR: decrement a number value by 1
- EXISTS: check if key exists
- FLUSHALL:  clear all keys (careful)
- EXPIRE: expire a key after certain number of secs
  - SET greeting "hello world"
  - EXPIRE greeting 50
- TTL: get key expire time remaining
- SETEX: set value and expire
  - SETEX greeting 30 "hello world"
- PERSIST: remove expiration for key that has one
- RENAME: rename key

## data types

[data type docs](https://redis.io/topics/data-types)

### lists 
_lists of strings, sorted by insertion order_
- LPUSH: prepend one or multiple elements
  - LPUSH people "dave"
  - people need not exist yet
- LLEN: length
- LPOP: remove from left
- LRANGE: get a renge of elements from a list
   - LRANGE my-list-name 0 -1 (to get all)
   - LRANGE my-list-name 1 2 (get elements 1, 2)
- RPUSH: append one or more elements
- RPOP: remove from right
- LINSERT: add before or after an element
   - LINISERT people BEFORE "dave" "katrina"
     
### sets

_unordered collection of Strings... it's possible to add, remove, and test for existence of members_

- SADD: add one or more members to set
  - SADD cars "subaru"
- SMEMBERS: get all members
- SCARD: length
- SISMEMBER: detemine if a given value is a member
- SMOVE: move a member from one list to another
  - SMOVE cars vehicles "subaru"
- SREM: remove a member
  - SREM vehicles "subaru"
  
### sorted sets

_similarly to sets, but every member is associated with score that is used to take the sorted set ordered, from the smallest to the largest score... members are unique but scores can be repeated_

- ZADD: add one or more members to set
  - ZADD users 77 "Dave"
- ZRANGE: range of members by index
  - ZRANGE users 0 -1 (to get all)
- ZRANK: determine member's index
- ZINCRBY: increment member by an increment
  - ZINCRBY users 1 "Dave" 

### hashes

_maps between string fields and string values, so they are the perfect data type to represent objects_

- HSET: set string value of a hash field
  - HSET user:dave name "Dave K"
    - creates hash user:dave and sets name value to Dave K
  - HSET user:dave email "dave@email.com"
- HGET: get value of a hash field
  - HGET user:dave name
- HGETALL: get all fields and values
  - HGETALL user:dave
- HDEL: delete a field
- HINCRBY: increment integer value of field
- HLEN: get number of fields
- HMSET: set values to multiple has fields
  - considered deprecated per docs
- HKEYS: get all the fields
- HVALS: get all the values

## persistence

[data persistence docs](https://redis.io/topics/persistence)

- point-in-time snap shots (RDB)
  - redis-cli shutdown: persists data and shuts down
  - save: takes a snapshot
  - save 60 1000: dump the dataset to disk every 60 secs if at least 1000 keys changed
  - dump.rdb will contain all the data
    - if you did quick setup
      - the dir in which you start redi-server has a dump.rdb file
    - if you did the "more proper" setup
      - data should persist in /var/redis
- append-only file (AOF)
  - every time there's a command that changes the dataset it will append it to the AOF, restart and it will re-play the AOF to rebuild the state
  - turn on the AOF in your configuration file: appendonly yes