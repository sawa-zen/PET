import {
  type AnimationClip,
  AnimationMixer,
  EventDispatcher,
  LoopRepeat,
  LoopOnce,
  type AnimationAction,
  type Object3D,
} from 'three'
import TWEEN from '@tweenjs/tween.js'

export class Action {
  private actionData: AnimationAction
  private name: string
  private weight = 0

  constructor(actionData: AnimationAction) {
    console.info('Action', actionData)
    this.name = actionData.getClip().name
    this.actionData = actionData
    this.actionData.setEffectiveWeight(0)
  }

  public getName() {
    return this.name
  }

  public getWeight = () => {
    return this.weight
  }

  public setWeight(val: number) {
    let weight = val
    if (val < 0) weight = 0
    if (1 < val) weight = 1
    this.weight = weight
    this.actionData.setEffectiveWeight(val)
  }

  public setLoop = (val: boolean) => {
    this.actionData.loop = val ? LoopRepeat : LoopOnce
  }

  public play() {
    this.actionData.play()
  }

  public reset() {
    this.actionData.reset()
  }
}

export interface Events {
  changeStart: { from: string | undefined; to: string }
  changeComplete: { from: string | undefined; to: string }
}

export class Manipulator extends EventDispatcher<Events> {
  private mixer: AnimationMixer
  private animationEnabled = false
  private actions: Action[] = []
  private currentAction?: Action

  get currentActionName() {
    return this.currentAction?.getName()
  }

  constructor(scene: Object3D, animations: AnimationClip[]) {
    super()

    this.mixer = new AnimationMixer(scene)

    this.actions = animations.map((animationClip) => {
      const action = this.mixer.clipAction(animationClip)
      return new Action(action)
    })
  }

  private findAction(name: string) {
    return this.actions.find((action) => {
      return action.getName() === name
    })
  }

  public to(actionName: string, duration: number, loop = false) {
    const oldAction = this.currentAction
    const newAction = this.findAction(actionName)

    if (oldAction?.getName() === actionName) return

    if (!newAction) {
      console.warn(`${actionName} is not found`)
      return
    }

    this.dispatchEvent({
      type: 'changeStart',
      from: oldAction?.getName(),
      to: newAction.getName(),
    })

    this.currentAction = newAction
    newAction.setLoop(loop)
    newAction.reset()
    newAction.play()

    const param = { weight: 0 }
    const tween = new TWEEN.Tween(param)
      .to({ weight: 1 }, duration)
      .onUpdate(() => {
        if (oldAction) {
          oldAction.setWeight(1 - param.weight)
        }
        newAction.setWeight(param.weight)
      })
      .onComplete(() => {
        this.dispatchEvent({
          type: 'changeComplete',
          from: oldAction?.getName(),
          to: newAction.getName(),
        })
      })

    tween.start()
  }

  public play(actionName: string, loop = false) {
    this.animationEnabled = true

    if (this.currentActionName === actionName) return

    if (actionName) {
      this.to(actionName, 0, loop)
    }
  }

  public pause() {
    this.animationEnabled = true
  }

  public update(delta: number) {
    if (!this.animationEnabled) return
    this.mixer.update(delta)
    TWEEN.update()
  }
}