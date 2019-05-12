---

## 0

### 0.2.0    2019-05-11

- Added CHANGELOG.md
- Made `getAccessToken`, `getAccessTokens` and `getActiveAccessTokens`
    abstract in `User` model so that each storage implementation implements
    them the way it makes more sense (needed to implement safe-auth-sequelize)
- Implemented `getAccessToken`, `getAccessTokens` and `getActiveAccessTokens`
    in `MemoryUser`


---
