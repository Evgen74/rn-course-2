import {runInAction, isAction} from 'mobx'

export async function invokeMethod(
  instance: any,
  name: string,
  args: any[] = [],
) {
  const fn = instance[name]
  if (typeof fn !== 'function') {
    throw new Error(`Method ${name} not found`)
  }

  const isAct = isAction?.(fn)
  const call = () => fn.apply(instance, args)
  const res = isAct ? runInAction(call) : call()

  return Promise.resolve(res)
}
