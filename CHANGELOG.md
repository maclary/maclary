# Changelog

All notable changes to this project will be documented in this file.

# [0.4.1](https://github.com/maclary/maclary/compare/0.4.0...0.4.1) - (2022-06-18)

## Bug Fixes

-   **Builtin:** Interaction create not handling modal submits ([4fc06c5](https://github.com/maclary/maclary/commit/4fc06c5f1f11e6d85ebeb894bde949e973c2ac86))

# Changelog

All notable changes to this project will be documented in this file.

# [0.4.0](https://github.com/maclary/maclary/compare/0.3.0...0.4.0) - (2022-06-18)

## Bug Fixes

-   **Client:** Missing support for prefix array ([b98381c](https://github.com/maclary/maclary/commit/b98381c4fb0a64914e86687edc34fd0817e29161))
-   Interaction isCommand is not a function ([62c0917](https://github.com/maclary/maclary/commit/62c09175de82196e3c6dc1d9a134b442d679e98c))
-   **Command:** Invalid error keys ([8188c6d](https://github.com/maclary/maclary/commit/8188c6dab6a77fbc1b4acbeea3dd292fe1e4072c))
-   Incorrect CustomId create method parameter types ([b34f68b](https://github.com/maclary/maclary/commit/b34f68b9420821113c7deafbf1bb0fae0d345e4b))

## Documentation

-   Improve comments ([76595f1](https://github.com/maclary/maclary/commit/76595f1ba6c917a88c8f3ad387d16c201905ac7d))

## Features

-   Add bot mention as a prefix ([2203d19](https://github.com/maclary/maclary/commit/2203d191ebc75eec094b6e871aeed7a07720f369))
-   Add Component and ComponentManager ([4d84f79](https://github.com/maclary/maclary/commit/4d84f7916d82f27f6e3492d8c77bc371196f7bc7))
-   Add CommandOptionsBuilder ([041e8fc](https://github.com/maclary/maclary/commit/041e8fc45c630013c512f44ebdf107cf2b8229c7))

## Refactor

-   Remove component timeouts ([00931cc](https://github.com/maclary/maclary/commit/00931ccb152c26d6e49a903e06b2cd284b120bfa))
-   Switch MACLARY_ENV to NODE_ENV ([cf7ad8a](https://github.com/maclary/maclary/commit/cf7ad8a0288f6132f568a913b71e367bd027729e))
-   Replace zod with joi ([1cb0f24](https://github.com/maclary/maclary/commit/1cb0f245c95b2b508ad86d20c78877c7f1bc60b5))
-   Change eslint and prettier configs ([35e075b](https://github.com/maclary/maclary/commit/35e075bdca9cb80e17f039bc70b70b057a1d26ba))
-   Export managers ([0d41c06](https://github.com/maclary/maclary/commit/0d41c068ac40d12678c61da2638e50fc47a6c6d0))

## Styling

-   Formatting ([48ac803](https://github.com/maclary/maclary/commit/48ac80398b4b5c64d0382022a715a90e4f172f85))

# [0.3.0](https://github.com/maclary/maclary/compare/0.2.0...0.3.0) - (2022-04-26)

## Bug Fixes

-   Command kinds not working in subcommands ([5eb8a43](https://github.com/maclary/maclary/commit/5eb8a430f1131e9b9e22f6291d00e26c61fbe92e))
-   Commands array containing booleans ([97d9ea6](https://github.com/maclary/maclary/commit/97d9ea620e33bb0a0070e5684c03a563406b2866))
-   Subcommands not checking preconditions ([66a6b8f](https://github.com/maclary/maclary/commit/66a6b8ff4401a98385045a1556501e5b4b08d53c))
-   **Errors:** Missing export for ReplyError ([d391a6f](https://github.com/maclary/maclary/commit/d391a6f2653fad864202cd033ad4c783cba1d38b))
-   **InteractionCreate:** Not catching ReplyErrors ([8e59794](https://github.com/maclary/maclary/commit/8e5979413d0ad4b1ad2b29505ea813adac1251bd))

## Documentation

-   **Managers:** Improve manager documentation ([6d7acad](https://github.com/maclary/maclary/commit/6d7acadf0dc54e83040be392c96683b03a863583))
-   Fix badges ([8e0c034](https://github.com/maclary/maclary/commit/8e0c0342f9c305a230cd8748d39d3c2de577d9a1))

## Features

-   Add support for multiple events exported from one file ([f856b4e](https://github.com/maclary/maclary/commit/f856b4ef058b583d691ea1ca8d0d17de82289d8a))
-   Add support for multiple commands exported from one file ([7d9f058](https://github.com/maclary/maclary/commit/7d9f05845188dd053ec0e0caf91269f8442b3678))
-   **Preconditions:** Client and user permissions ([eee474b](https://github.com/maclary/maclary/commit/eee474bc34a9dd6746cce2ee73a2f5c5798b2126))
-   Improve exports ([6cb92fb](https://github.com/maclary/maclary/commit/6cb92fb2577c47b70c5df863e167f7d34dda3b5a))

## Refactor

-   Fix importing missing module ([59fea90](https://github.com/maclary/maclary/commit/59fea90a82ff7e2fd45d1b9f4e0a526d223ffb92))
-   Remove twemoji ([d2a397d](https://github.com/maclary/maclary/commit/d2a397d4fe6b0ac347cb6dc3f4db34c259a59c02))

# [0.2.0](https://github.com/maclary/maclary/compare/0.1.0...0.2.0) - (2022-04-23)

## Bug Fixes

-   **Internal:** Compare commands required option ([80f5bc9](https://github.com/maclary/maclary/commit/80f5bc915cffe240a74be662d3d2a242542b77b4))
-   **Internal:** Compare commands ([4e16c18](https://github.com/maclary/maclary/commit/4e16c1848cb4b9db85a2f41a4b656a34ccfbbbfa))
-   **Preconditions:** Missing exports ([016c697](https://github.com/maclary/maclary/commit/016c6977fb0bd9669f88dda4195ec3afbfc18278))
-   **CustomId:** Parsing error when normal id ([08b08f7](https://github.com/maclary/maclary/commit/08b08f787acdbda749f0f6bbabfaca13160c414b))
-   **Command:** Command group onMessage find command ([f7548d4](https://github.com/maclary/maclary/commit/f7548d402e5ee5f6e8d8601677a58fa38e182c26))
-   Add command prefix validation ([c75eebc](https://github.com/maclary/maclary/commit/c75eebc6ca2089b25d00169b645fb54df44c16c7))

## Features

-   Add development mode ([dbc8a7b](https://github.com/maclary/maclary/commit/dbc8a7bf58527064a55b84674e1d1b0dc54c6583))
-   **Preconditions:** Add BotOwnerOnly precondition ([bc08332](https://github.com/maclary/maclary/commit/bc0833247f5fd18bfc59f3929798ab27922d29d0))
-   **Preconditions:** Add GuildOwnerOnly precondition ([3d49fda](https://github.com/maclary/maclary/commit/3d49fdaaa017a8ab607245eedcb3aca7b9a33807))

## Refactor

-   **Preconditions:** Reword error messages ([b896c98](https://github.com/maclary/maclary/commit/b896c98c810504da1c79a1a36275bf1b59690e2b))

## Typings

-   **Command:** Add context menu union type ([b3dd029](https://github.com/maclary/maclary/commit/b3dd0294d3947dd0b797f06e82003531b7cfd5a2))

# 0.1.0 - (2022-04-19)

## Initial Release
