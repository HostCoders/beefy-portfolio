/* eslint-disable */
import type {AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType} from 'axios'
import axios from 'axios'

export interface ApproveSpenderResponseDto {
  /** Address of the 1inch router that must be trusted to spend funds for the exchange */
  address: string
}

export interface ApproveCalldataResponseDto {
  /** The encoded data to call the approve method on the swapped token contract */
  data: string
  /** Gas price for fast transaction processing */
  gasPrice: string
  /**
     * Token address that will be allowed to exchange through 1inch router
     * @example "0x6b175474e89094c44da98b954eedeac495271d0f"
     */
  to: string
  /** Native token value in WEI (for approve is always 0) */
  value: string
}

export interface TokenDto {
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI: string
}

export interface TokensResponseDto {
  /** List of supported tokens */
  tokens: TokenDto[]
}

export interface ProtocolImageDto {
  /** Protocol id */
  id: string
  /** Protocol title */
  title: string
  /** Protocol logo image */
  img: string
  /** Protocol logo image in color */
  img_color: string
}

export interface ProtocolsResponseDto {
  /** List of protocols that are available for routing in the 1inch Aggregation protocol */
  protocols: ProtocolImageDto[]
}

export interface PathViewDto {
  name: string
  part: number
  fromTokenAddress: string
  toTokenAddress: string
}

export interface QuoteCustomResponseDto {
  /** Source token info */
  fromToken: TokenDto
  /** Destination token info */
  toToken: TokenDto
  /** Expected amount of destination token */
  toAmount: string
  /** Selected protocols in a path */
  protocols: PathViewDto[]
  /** Estimated gas */
  gas: number
}

export interface NestErrorMeta {
  /**
     * Type of field
     * @example "fromTokenAddress"
     */
  type: string
  /**
     * Value of field
     * @example "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
     */
  value: object
}

export interface SwapErrorDto {
  /**
     * HTTP code
     * @example 400
     */
  statusCode: number
  /**
     * Error code description
     * @example "Bad Request"
     */
  error: string
  /** Error description (one of the following) */
  description: string
  /** Request id */
  requestId: string
  /** Meta information */
  meta: NestErrorMeta[]
}

export interface TxDto {
  from: string
  to: string
  data: string
  value: string
  gasPrice: string
  gas: number
}

export interface SwapCustomResponseDto {
  /** Source token info */
  fromToken: TokenDto
  /** Destination token info */
  toToken: TokenDto
  /** Expected amount of destination token */
  toAmount: string
  /** Selected protocols in a path */
  protocols: string[]
  /** Transaction object */
  tx: TxDto
}

export type QueryParamsType = Record<string | number, any>

export interface FullRequestParams extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url' | 'responseType'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType
  /** request body */
  body?: unknown
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, 'data' | 'cancelToken'> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void
  secure?: boolean
  format?: ResponseType
}

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance
  private securityData: SecurityDataType | null = null
  private readonly securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private readonly secure?: boolean
  private readonly format?: ResponseType

  constructor ({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || '' })
    this.secure = secure
    this.format = format
    this.securityWorker = securityWorker
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
            ((typeof secure === 'boolean' ? secure : this.secure) &&
                this.securityWorker &&
                (await this.securityWorker(this.securityData))) ||
            {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const responseFormat = format || this.format || undefined

    if (type === ContentType.FormData && body && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>)
    }

    if (type === ContentType.Text && body && typeof body !== 'string') {
      body = JSON.stringify(body)
    }

    return await this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {})
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path
    })
  }

  protected mergeRequestParams (params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method)

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {})
      }
    }
  }

  protected stringifyFormItem (formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem)
    } else {
      return `${formItem}`
    }
  }

  protected createFormData (input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key]
      const propertyContent: any[] = property instanceof Array ? property : [property]

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem))
      }

      return formData
    }, new FormData())
  }
}

/**
 * @title 1inch Swap API
 * @version 5.2
 * @contact
 *
 *
 * <h2>Ethereum Network</h2>
 * Using 1inch Swap API, you can find the best route to exchange assets and make the exchange.
 * <br><br>
 * Step by step:
 * 1. Lookup addresses of tokens you want to swap, for example ‘0xxx’ , ‘0xxxx’ for DAI -> 1INCH
 * 2. Check for allowance of 1inch router contract to spend source asset (/approve/allowance)
 * 3. If necessary, give approval for 1inch router to spend source token (/approve/transaction)
 * 4. Monitor the best exchange route using (/quote)
 * 5. When you ready use to perform swap (/swap)
 *
 */
export class OneInchV5<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  v52 = {
    /**
         * No description
         *
         * @tags Healthcheck
         * @name FactoryHealthCheckControllerHealthcheck
         * @summary API health check
         * @request GET:/v5.2/${chainID}/healthcheck
         */
    factoryHealthCheckControllerHealthcheck: async (chainID: number, params: RequestParams = {}) =>
      await this.request<void, any>({
        path: `/v5.2/${chainID}/healthcheck`,
        method: 'GET',
        ...params
      }),

    /**
         * No description
         *
         * @tags Approve
         * @name ChainApproveControllerGetSpender
         * @summary Address of the 1inch router that must be trusted to spend funds for the exchange
         * @request GET:/v5.2/${chainID}/approve/spender
         */
    chainApproveControllerGetSpender: async (chainID: number, params: RequestParams = {}) =>
      await this.request<ApproveSpenderResponseDto, any>({
        path: `/v5.2/${chainID}/approve/spender`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
         * No description
         *
         * @tags Approve
         * @name ChainApproveControllerGetCallData
         * @summary Generate data for calling the contract in order to allow the 1inch router to spend funds
         * @request GET:/v5.2/${chainID}/approve/transaction
         */
    chainApproveControllerGetCallData: async (chainID: number,
      query: {
        /**
                 * Token address you want to exchange
                 * @example "0x111111111117dc0aa78b770fa6a738034120c302"
                 */
        tokenAddress: string
        /**
                 * The number of tokens that the 1inch router is allowed to spend.If not specified, it will be allowed to spend an infinite amount of tokens.
                 * @example "100000000000"
                 */
        amount?: string
      },
      params: RequestParams = {}
    ) =>
      await this.request<ApproveCalldataResponseDto, any>({
        path: `/v5.2/${chainID}/approve/transaction`,
        method: 'GET',
        query,
        format: 'json',
        ...params
      }),

    /**
         * No description
         *
         * @tags Approve
         * @name ChainApproveControllerGetAllowance
         * @summary Get the number of tokens that the 1inch router is allowed to spend
         * @request GET:/v5.2/${chainID}/approve/allowance
         */
    chainApproveControllerGetAllowance: async (chainID: number,
      query: {
        /**
                 * Token address you want to exchange
                 * @example "0x111111111117dc0aa78b770fa6a738034120c302"
                 */
        tokenAddress: string
        /** Wallet address for which you want to check */
        walletAddress: string
      },
      params: RequestParams = {}
    ) =>
      await this.request<void, any>({
        path: `/v5.2/${chainID}/approve/allowance`,
        method: 'GET',
        query,
        ...params
      }),

    /**
         * No description
         *
         * @tags Info
         * @name ChainTokensControllerGetTokens
         * @summary List of tokens that are available for swap in the 1inch Aggregation protocol
         * @request GET:/v5.2/${chainID}/tokens
         */
    chainTokensControllerGetTokens: async (chainID: number, params: RequestParams = {}) =>
      await this.request<TokensResponseDto, any>({
        path: `/v5.2/${chainID}/tokens`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
         * No description
         *
         * @tags Info
         * @name ChainPresetsControllerGetPresets
         * @summary List of preset configurations for the 1inch router
         * @request GET:/v5.2/${chainID}/presets
         */
    chainPresetsControllerGetPresets: async (chainID: number, params: RequestParams = {}) =>
      await this.request<void, any>({
        path: `/v5.2/${chainID}/presets`,
        method: 'GET',
        ...params
      }),

    /**
         * No description
         *
         * @tags Info
         * @name ChainProtocolsControllerGetProtocolsImages
         * @summary List of liquidity sources that are available for routing in the 1inch Aggregation protocol
         * @request GET:/v5.2/${chainID}/liquidity-sources
         */
    chainProtocolsControllerGetProtocolsImages: async (chainID: number, params: RequestParams = {}) =>
      await this.request<ProtocolsResponseDto, any>({
        path: `/v5.2/${chainID}/liquidity-sources`,
        method: 'GET',
        format: 'json',
        ...params
      }),

    /**
         * No description
         *
         * @tags Swap
         * @name ExchangeControllerGetQuote
         * @summary Find the best quote to exchange via 1inch router
         * @request GET:/v5.2/${chainID}/quote
         */
    exchangeControllerGetQuote: async (chainID: number,
      query: {
        /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
        src: string
        /** @example "0x111111111117dc0aa78b770fa6a738034120c302" */
        dst: string
        /** @example "10000000000000000" */
        amount: string
        /** default: all */
        protocols?: string
        /** Min: 0; max: 3; Max: 0; max: 3; default: 0;  !should be the same for quote and swap! */
        fee?: string
        /** Return fromToken and toToken info in response */
        includeTokensInfo?: boolean
        /** Return swap protocols in response */
        includeProtocols?: boolean
        /** Return estimated gas in response */
        includeGas?: boolean
        gasLimit?: any
        /** max: 5; !should be the same for quote and swap! */
        connectorTokens?: any
        /** min: 0; max: 3; default: 2; !should be the same for quote and swap! */
        complexityLevel?: any
        /** default: 10; max: 50  !should be the same for quote and swap! */
        mainRouteParts?: any
        /** split parts. default: 50;  max: 100!should be the same for quote and swap! */
        parts?: any
        /** default: fast from network */
        gasPrice?: any
      },
      params: RequestParams = {}
    ) =>
      await this.request<QuoteCustomResponseDto, SwapErrorDto>({
        path: `/v5.2/${chainID}/quote`,
        method: 'GET',
        query,
        format: 'json',
        ...params
      }),

    /**
         * No description
         *
         * @tags Swap
         * @name ExchangeControllerGetSwap
         * @summary Generate data for calling the 1inch router for exchange
         * @request GET:/v5.2/${chainID}/swap
         */
    exchangeControllerGetSwap: async (chainID: number,
      query: {
        /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
        src: string
        /** @example "0x111111111117dc0aa78b770fa6a738034120c302" */
        dst: string
        /** @example "10000000000000000" */
        amount: string
        /** The address that calls the 1inch contract */
        from: string
        /**
                 * min: 0; max: 50;
                 * @example 1
                 */
        slippage: number
        /** default: all */
        protocols?: string
        /** Min: 0; max: 3; Max: 0; max: 3; default: 0;  !should be the same for quote and swap! */
        fee?: string
        disableEstimate?: boolean
        /** https://eips.ethereum.org/EIPS/eip-2612 */
        permit?: string
        /** Return fromToken and toToken info in response */
        includeTokensInfo?: boolean
        /** Return swap protocols in response */
        includeProtocols?: boolean
        /** Allows to build calldata without optimized routers */
        compatibility?: boolean
        allowPartialFill?: boolean
        /** split parts. default: 50;  max: 100!should be the same for quote and swap! */
        parts?: any
        /** default: 10; max: 50  !should be the same for quote and swap! */
        mainRouteParts?: any
        /** max: 5; !should be the same for quote and swap! */
        connectorTokens?: any
        /** min: 0; max: 3; default: 2; !should be the same for quote and swap! */
        complexityLevel?: any
        gasLimit?: any
        /** default: fast from network */
        gasPrice?: any
        referrer?: any
        /** Receiver of destination currency. default: from */
        receiver?: any
      },
      params: RequestParams = {}
    ) =>
      await this.request<SwapCustomResponseDto, SwapErrorDto>({
        path: `/v5.2/${chainID}/swap`,
        method: 'GET',
        query,
        format: 'json',
        ...params
      })
  }
}
