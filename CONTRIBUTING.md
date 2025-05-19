# Contributing to redismn

Welcome, and thanks for your interest in contributing to **redismn**!   
This document will guide you through the steps to get started and make meaningful contributions.

---

##  What is redismn?

Redismn is a Node.js library that simplifies interactions with Redis-Stack. It provides an intuitive API for storing documents, querying, atomic transactions, and advanced aggregations.currently fully supported fo json (every feature).(hset ,set ,zset,timeseries and bloom are currently developed by us).Each function is designed for single call.

- Redis JSON
- Redis Search
- Atomic commands,((single call))
- Aggregations & documents,(single call)

---

## Setup & Development

### Prerequisites

- Node.js v14 or higher
- Redis Stack running locally (or connect to a remote instance)

### Quick Start

```bash
git clone https://github.com/redismn/redismn.git
cd redismn
npm install
npm test
```

## How to Contribute

### Reporting Bugs
If you encounter any bugs or issues, please:

1. Check if the issue already exists in the Issues tab.

2. Open a new issue with a clear and descriptive title.


### Suggesting Enhancements

Have an idea to improve redismn? We welcome suggestions! Please:

1. Search existing issues to avoid duplicates.

2. Open a new issue with:

   - A clear and descriptive title

   - Detailed explanation of the enhancement

   - Potential benefits and use cases

Here's a clean and well-formatted CONTRIBUTING.md file based on the content you shared, structured in markdown:




##  Submitting Pull Requests

We appreciate your efforts to improve redismn! Follow these steps to submit a pull request:

1. ✅ Fork the repository.

2. 🛠️ Create a new branch for your feature or bugfix:

```bash
   git checkout -b feature/your-feature-name
````

3 Make your changes and ensure they follow the project's coding standards.

4. Write or update tests to cover your changes (if applicable).

5. Commit your changes with a clear and descriptive message:

   ```bash
   git commit -m "Add feature: your feature description"
   ```

6.  Push to your forked repository:

   ```bash
   git push origin feature/your-feature-name
   ```

7.  Open a pull request (PR) against the main branch of the original repository.

---

## Code Style and Guidelines

* Use consistent coding styles and conventions throughout the codebase.
* Write clear, descriptive comments and jsdoc where needed.
* Structure your code for readability and maintainability.

---

##  License

By contributing to redismn, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

##  Thank You

Thank you for being a part of the redismn community!
Your contributions make a significant impact. If you have any questions or need help, feel free to:

* Open an issue on GitHub
* Start a discussion
* Reach out to the maintainers


