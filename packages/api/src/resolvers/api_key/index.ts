import { ApiKey } from '../../entity/api_key'
import { env } from '../../env'
import {
  ApiKeysError,
  ApiKeysErrorCode,
  ApiKeysSuccess,
  GenerateApiKeyError,
  GenerateApiKeyErrorCode,
  GenerateApiKeySuccess,
  MutationGenerateApiKeyArgs,
  MutationRevokeApiKeyArgs,
  RevokeApiKeyError,
  RevokeApiKeyErrorCode,
  RevokeApiKeySuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { generateApiKey, hashApiKey } from '../../utils/auth'
import { authorized } from '../../utils/helpers'

export const apiKeysResolver = authorized<ApiKeysSuccess, ApiKeysError>(
  async (_, __, { log, authTrx }) => {
    try {
      const apiKeys = await authTrx<Promise<ApiKey[]>>(async (tx) => {
        return tx.find(ApiKey, {
          select: ['id', 'name', 'scopes', 'expiresAt', 'createdAt', 'usedAt'],
          order: {
            usedAt: { direction: 'DESC', nulls: 'last' },
            createdAt: 'DESC',
          },
        })
      })

      return {
        apiKeys,
      }
    } catch (e) {
      log.error('apiKeysResolver error', e)

      return {
        errorCodes: [ApiKeysErrorCode.BadRequest],
      }
    }
  }
)

export const generateApiKeyResolver = authorized<
  GenerateApiKeySuccess,
  GenerateApiKeyError,
  MutationGenerateApiKeyArgs
>(async (_, { input: { name, expiresAt } }, { authTrx, log, uid }) => {
  try {
    const exp = new Date(expiresAt)
    const originalKey = generateApiKey()
    const apiKeyCreated = await authTrx<Promise<ApiKey>>(async (tx) => {
      return tx.save(ApiKey, {
        user: { id: uid },
        name,
        key: hashApiKey(originalKey),
        expiresAt: exp,
      })
    })

    analytics.track({
      userId: uid,
      event: 'api_key_generated',
      properties: {
        name,
        expiresAt: exp,
        env: env.server.apiEnv,
      },
    })

    return {
      apiKey: {
        ...apiKeyCreated,
        key: originalKey,
      },
    }
  } catch (error) {
    log.error('generateApiKeyResolver', error)

    return { errorCodes: [GenerateApiKeyErrorCode.BadRequest] }
  }
})

export const revokeApiKeyResolver = authorized<
  RevokeApiKeySuccess,
  RevokeApiKeyError,
  MutationRevokeApiKeyArgs
>(async (_, { id }, { claims: { uid }, log, authTrx }) => {
  try {
    const deletedApiKey = await authTrx<Promise<ApiKey | null>>(async (tx) => {
      const apiKey = await tx.findOneBy(ApiKey, { id })
      if (!apiKey) {
        return null
      }

      return tx.remove(ApiKey, apiKey)
    })

    if (!deletedApiKey) {
      return {
        errorCodes: [RevokeApiKeyErrorCode.NotFound],
      }
    }

    analytics.track({
      userId: uid,
      event: 'api_key_revoked',
      properties: {
        id,
        env: env.server.apiEnv,
      },
    })

    return {
      apiKey: {
        ...deletedApiKey,
        id,
        key: null,
      },
    }
  } catch (e) {
    log.error('revokeApiKeyResolver error', e)

    return {
      errorCodes: [RevokeApiKeyErrorCode.BadRequest],
    }
  }
})
