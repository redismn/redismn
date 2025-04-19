# RedisExp - Simplified Redis client library.

RedisExp is a Node.js library that simplifies interactions with RedisJSON and RediSearch. It provides an intuitive API for storing JSON documents, querying, atomic transactions, and advanced aggregations.(hset ,set ,zset,timeseries and bloom are currently developed by us)

## Features

- **CRUD Operations**: Store, retrieve, and update JSON documents.
- **Index Management**: Define search schemas for efficient querying.
- **Flexible Queries**: Perform text, range, and key-value searches.
- **Atomic Transactions**: Chain multiple operations in a single transaction.
- **Aggregation Pipelines**: Group, filter, sort, and reduce data with method chaining.
- **update after aggregate**: after filter,sort and limit you can update those fields(atomic operation ,no multiple queries(single query))
  Got it! Here's the updated README snippet with the correct function name: `update`.

---

### 🔄 `new feature` – Update Values for WhereAggregator (Atomically)

This function is used by **WhereAggregator** to **update values it finds**, and it's optimized for **atomic performance** – no need to worry about slowdowns!

####  Usage

```js
update(arrofrequiredfieldforop, pathinput, method, eqn);
```

####  Parameters

- **`arrofrequiredfieldforop`** (`string[]`):  
  An array of required field names from your schema used in the equation.

- **`pathinput`** (`string`):  
  A simple JSON path to the field you want to update.  
  _Example_: For an object like `{ name: 'john doe', data: { friends: [] } }`, use:
  ```js
  "data.friends"
  ```

- **`method`** (`string`):  
  The update method.
  - Currently only `"set"` is supported.
  - `"push"` will be added soon.

- **`eqn`** (`string`):  
  A string equation using the following operators:
  - Arithmetic: `+`, `-`, `*`, `/`
  - Concatenation: `&`  
    _Important notes_:
  - No brackets supported — expressions are evaluated **left to right**.
  - Only use keys from the schema and direct values.
  - Example:
    ```js
    "2+age*6&first_name"
    // Interpreted as: ((2 + age) * 6) & first_name
    ```

> A version that supports full BODMAS (order of operations) will be released later with a trade-off in performance.

---

Let me know if you want to include example input/output or a quick visual of how `eqn` is parsed!
## Installation

Ensure Redis is running with [RedisJSON](https://redis.io/docs/stack/json/) and [RediSearch](https://redis.io/docs/stack/search/) modules.

```bash
npm install ioredis redismn
```

## Usage

### Initialize Client

```javascript
import RedisExp from 'redismn';

const redis = new RedisExp("localhost", 6379);
await redis.start(); // Connects to Redis
```

### Define Schema

Create a search index to enable queries on specific fields.

```javascript
await redis.jsonSchemaIdx("User", [
  { key_name: "id", tag_type: "NUMERIC", sortable: true },
  { key_name: "name", tag_type: "TEXT", sortable: true },
  { key_name: "age", tag_type: "NUMERIC" }
]);
```

### Store Data

```javascript
await redis.jsonset("user1", { name: "Alice", age: 30 }, "User", 3600);
// Expires in 1 hour
```

### Retrieve Data

**Get entire object:**
```javascript
const user = await redis.jsongetAll("user1", "User");
console.log(user); // { name: "Alice", age: 30 }
```

**Get nested property:**
```javascript
const age = await redis.jsonget("user1", "age", "User");
console.log(age); // 30
```

### Query Data

**Key-value search:**
```javascript
const results = await redis.jsonquery("name", "Alice", "User");
console.log(results); // Array of matching documents
```
see availible queries using 'jsonqueryTextavailible' function\
**Full-text search:**
```javascript
const results = await redis.jsonqueryText("@age:[25 35]", "User");
// Returns users aged 25-35

```

### Atomic Transactions

where has two parameters `modelname` and `ttl`.\
you can add as many as you want jsonset and jsonget.\
Chain `jsonset` and `jsonget` in a single Redis call:
```javascript
const transaction = await redis.where("User")
  .jsonset("user2", { name: "Bob", age: 25 })
  .jsonget("user1", "")
  .exec();

console.log(transaction); // [ { name: "Alice", age: 30 } ]
```

### Aggregation Queries

**Filter and group:**
```javascript
const result = await redis.whereagregater("User")
  .jsonnumrange("age", 20, 40)
  .jsongroup("age")
  .jsonaccumulator("age", "SUM")
  .exec();

console.log(result);
// [ { age_SUM: "55" } ] (Sum of ages in 20-40 group)
```

**Sort and limit:**
```javascript
const result = await redis.whereagregater("User")
  .jsonsort("age", "DESC")
  .jsonskiplimit(0, 5)
  .exec("name", "age");

console.log(result);
// Top 5 oldest users with name and age fields
```

## API Reference

### Core Methods

#### `jsonset(key, jsonobj, model_name, ttl)`
- **key**: Unique identifier.
- **jsonobj**: JSON object to store.
- **model_name**: Namespace (like a collection).
- **ttl**: Optional expiration in seconds.

#### `jsongetAll(key, model_name)`
- Returns the entire JSON object stored at `key`.

#### `jsonget(key, pathinput, model_name)`
- **pathinput**: Dot-separated path to nested property (e.g., `"address.city"`).

#### `jsonSchemaIdx(model_name, key_tag_arr)`
- **key_tag_arr**: Array of objects defining index schema:
  ```javascript
  { key_name: "field", tag_type: "TEXT|NUMERIC|TAG", sortable: true }
  ```

### Query Methods

#### `jsonquery(key, val, model_name)`
- Key-value search (supports numeric and text values).

#### `jsonqueryText(query, model_name)`
- **query**: RediSearch query string (e.g., `"@age:[20 30]"`).

### Aggregation Builder (via `whereagregater`)

Methods are chainable before calling `exec()`:

- **Filtering**:
  - `jsonnumrange(key, min, max)`: Numeric range filter.
  - `jsonequals(key, value)`: Exact match.
  - `jsongte(key, value)`: Greater than or equal.

- **Grouping**:
  - `jsongroup(key)`: Group by a field.
  - `jsonaccumulator(key, reducer)`: Apply reducers (`SUM`, `MAX`, `TOLIST`).

- **Sorting/Pagination**:
  - `jsonsort(key, order)`: Sort results (`ASC`/`DESC`).
  - `jsonskiplimit(offset, count)`: Paginate results.




### Complex Aggregation

```javascript
const salesReport = await redis.whereagregater("Sales")
  .jsonnumrange("amount", 100, 1000)
  .jsongroup("product")
  .jsonaccumulator("amount", "SUM")
  .jsonsort("SUM_amount", "DESC")
  .exec("product", "SUM_amount");

console.log(salesReport);
// [ { product: "Widget", SUM_amount: "4500" }, ... ]
```

### jsdoc

# RedisExp API Documentation

A Node.js wrapper for RedisJSON and RediSearch operations. Provides methods for CRUD, indexing, querying, transactions, and aggregations.

## Core Methods

### `jsonset(key, jsonobj, model_name, ttl)`
- **Description**: Stores a JSON object under a key with optional TTL.
- **Parameters**:
  - `key` (String): Unique identifier (e.g., `"user1"`).
  - `jsonobj` (Object): JSON data to store (e.g., `{ name: "Alice" }`).
  - `model_name` (String): Namespace for data organization (e.g., `"User"`).
  - `ttl` (Number, Optional): Expiration time in seconds.
- **Throws**: Error if `key`, `jsonobj`, or `model_name` are missing.

### `jsongetAll(key, model_name)`
- **Description**: Retrieves the full JSON object by key.
- **Parameters**:
  - `key` (String): Object identifier.
  - `model_name` (String): Namespace.
- **Returns**: (Object | undefined) Parsed JSON or `undefined` if not found.

### `jsonget(key, pathinput, model_name)`
- **Description**: Fetches a nested property using a dot path.
- **Parameters**:
  - `key` (String): Object identifier.
  - `pathinput` (String): Path to nested property (e.g., `"data.friends`).
  - `model_name` (String): Namespace.
- **Returns**: (any | undefined) Property value or `undefined`.

### `jsonSchemaIdx(model_name, key_tag_arr)`
- **Description**: Creates a search index schema.
- **Parameters**:
  - `model_name` (String): Namespace.
  - `key_tag_arr` (Array<Object>): Schema definitions:
    - `key_name` (String): JSON field name.
    - `tag_type` (String): `"TEXT"`, `"NUMERIC"`, `"TAG"`, or `"ARRAY"`.
    - `sortable` (Boolean, Optional): Enable sorting.
    - `arr_type` (String, Required if `tag_type="ARRAY"`): Type of array elements.

---

## Query Methods

### `jsonquery(key, val, model_name, preprocessor_optional)`
- **Description**: Key-value search (exact match).
- **Parameters**:
  - `key` (String): Field name (e.g., `"age"`).
  - `val` (String | Number): Value to match.
  - `model_name` (String): Namespace.
  - `preprocessor_optional` (Function, Optional): Custom result parser.
- **Returns**: (Array<[key, Object]>) Matched entries.

### `jsonqueryText(val, model_name, preprocessor_optional)`
- **Description**: Full-text search using RediSearch syntax.
- **Parameters**:
  - `val` (String): Query string (e.g., `"@age:[20 30]"`).
  - `model_name` (String): Namespace.
  - `preprocessor_optional` (Function, Optional): Custom parser.
- **Returns**: (Array<[key, Object]>) Matched entries.

---

## Atomic Transactions

### `where(model_name, ttl)`
- **Description**: Chains multiple operations in a single transaction.
- **Parameters**:
  - `model_name` (String): Namespace.
  - `ttl` (Number, Optional): Default TTL for writes.
- **Returns**: `queryconstructor` instance with methods:
  - **`.jsonset(key, jsonobj)`**: Queue a write.
  - **`.jsonget(key, pathinput)`**: Queue a read.
  - **`.exec()`**: Execute all queued operations atomically.

**Example**:
```javascript
await redis.where("User", 3600)
  .jsonset("user2", { name: "Bob" })
  .jsonget("user1", "")
  .exec();
```



## Aggregation Queries

### `whereagregater(model_name)`
- **Description**: Builds aggregation pipelines (filter, group, sort).
- **Parameters**:
  - `model_name` (String): Namespace.
- **Returns**: `advancequeries` instance with methods:

| Method | Parameters | Description |
|--------|------------|-------------|
| `jsonnumrange(key, min, max)` | `key` (String), `min`/`max` (Number) | Numeric range filter. |
| `jsonequals(key, value)` | `key` (String), `value` (any) | Exact value match. |
| `jsonskiplimit(offset, number)` | `offset` (Number), `number` (Number) | Pagination. |
| `jsongroup(key)` | `key` (String) | Group by field. |
| `jsonaccumulator(key, reducer)` | `key` (String), `reducer` (`"SUM"`, `"MAX"`, etc.) | Aggregate grouped data. |
| `exec(...keys)` | `...keys` (String, Optional) | Execute pipeline and return selected fields. |

**Example**:
```javascript
const report = await redis.whereagregater("Sales")
  .jsonnumrange("amount", 100, 500)
  .jsongroup("product")
  .jsonaccumulator("amount", "SUM")
  .exec("product", "SUM_amount");
```

---

## Helper Methods

### `jsonqueryTextavailible()`
- **Returns**: (Object) Query syntax cheat sheet for `jsonqueryText`.

```javascript
{
  "simpletext": "Search for text in any field",
  "@key:value": "Exact field match",
  "@key:[min max]": "Numeric range",
  // ... (see code for full list)
}
```

---

## Example Usage

### Bulk Insert with TTL

```javascript
await redis.where("User", 3600) // TTL 1 hour
  .jsonset("user3", { name: "Carol", age: 28 })
  .jsonset("user4", { name: "Dave", age: 32 }).jsonget("user4","")
  .exec();

```
```javascript
// Define schema
await redis.jsonSchemaIdx("User", [
  { key_name: "id", tag_type: "NUMERIC", sortable: true },
  { key_name: "name", tag_type: "TEXT" }
]);

// Insert data
await redis.jsonset("alice", { id: 1, name: "Alice" }, "User", 3600);

// Query
const user = await redis.jsongetAll("alice", "User");
console.log(user); // { id: 1, name: "Alice" }

// Full-text search
const results = await redis.jsonqueryText("@name:Alice", "User");
```