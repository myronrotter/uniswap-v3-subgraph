import { store } from '@graphprotocol/graph-ts'

import { PoolLiquidityProvider } from '../../../generated/schema'
import { Burn as BurnEvent } from '../../../generated/templates/Pool/Pool'
import { ONE_BI, ZERO_BI } from '../../common/constants'
import { getPool } from '../../common/entityGetters'

export function handleBurn(event: BurnEvent): void {
    const pool = getPool(event.address)
    if (!pool) return

    const providerId = pool.id.toHexString() + '-' + event.params.owner.toHexString()
    const lp = PoolLiquidityProvider.load(providerId)
    if (lp) {
        lp.liquidity = lp.liquidity.minus(event.params.amount)
        if (lp.liquidity.le(ZERO_BI)) {
            store.remove('PoolLiquidityProvider', providerId)
            pool.liquidityProviderCount = pool.liquidityProviderCount.minus(ONE_BI)
        } else {
            lp.save()
        }
        pool.save()
    }
}
