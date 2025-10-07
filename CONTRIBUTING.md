# Git Commit Guidelines

We follow conventional commit standards to maintain a clean and readable project history. Please adhere to these guidelines when contributing to this project.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

| Type       | Description                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `feat`     | A new feature for the user                                                                             |
| `fix`      | A bug fix for the user                                                                                 |
| `docs`     | Documentation only changes                                                                             |
| `style`    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) |
| `refactor` | A code change that neither fixes a bug nor adds a feature                                              |
| `test`     | Adding missing tests or correcting existing tests                                                      |
| `chore`    | Changes to the build process or auxiliary tools and libraries                                          |
| `perf`     | A code change that improves performance                                                                |
| `ci`       | Changes to our CI configuration files and scripts                                                      |
| `build`    | Changes that affect the build system or external dependencies                                          |

### Scope (Optional)

The scope should be the name of the component affected (e.g., `auth`, `api`, `ui`, `database`).

### Subject

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end
- Maximum 50 characters

### Body (Optional)

- Use the imperative, present tense
- Wrap at 72 characters
- Explain what and why vs. how
- Include motivation for the change and contrast with previous behavior

### Footer (Optional)

- Reference GitHub issues that this commit closes
- Note any breaking changes

## Examples

### Simple feature addition

```
feat(auth): add two-factor authentication

Implement TOTP-based 2FA for enhanced account security.
Users can now enable 2FA in their profile settings.

Closes #145
```

### Bug fix

```
fix: resolve login redirect loop

Users were getting stuck in infinite redirect when accessing
protected routes after session expiry. Fixed by properly
clearing expired tokens.

Fixes #198
```

### Documentation update

```
docs: update API documentation for v2.0

Add examples for new endpoints and clarify authentication
requirements for existing routes.
```

### Breaking change

```
feat(api): redesign user authentication flow

BREAKING CHANGE: The login endpoint now returns JWT tokens
instead of session cookies. Update your client implementations
to use Authorization header with Bearer tokens.

Closes #167

## Commit Message Validation

This project uses commit linting to enforce these standards. Your commits will be automatically validated, and pull requests with non-conforming commit messages will be rejected.

## Tools

We recommend using [Commitizen](https://github.com/commitizen/cz-cli) for guided commit message creation:


## Why These Rules?

- **Consistency**: Uniform commit messages across the team
- **Automation**: Enables automatic changelog generation
- **Navigation**: Easy filtering and searching of commit history
- **Integration**: Better tooling support for releases and deployments
```
