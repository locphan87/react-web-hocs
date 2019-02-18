import React, { CSSProperties } from 'react'
import { compose, withProps, withState } from 'recompose'

interface IUpdateOptions {
  updates?: string[]
  component: any
  updatingStyle?: CSSProperties
  updatingName?: string
}
interface Styles {
  [name: string]: CSSProperties
}

const withUpdating = ({
  component: LoadingComponent,
  updatingStyle,
  updatingName = 'isUpdating'
}) => WrappedComponent => props => {
  const mergedStyle = {
    ...styles.updating,
    updatingStyle
  }

  return (
    <div style={styles.container}>
      <WrappedComponent {...props} />
      {props[updatingName] && <LoadingComponent style={mergedStyle} />}
    </div>
  )
}
const styles: Styles = {
  container: {
    position: 'relative'
  },
  updating: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    display: 'flex',
    width: '100%',
    background: 'rgba(255,255,255,0.5)'
  }
}

const simulatePending = updates => props =>
  updates.reduce((acc, updatePropName) => {
    acc[updatePropName] = async (...args) => {
      try {
        props.setUpdating(true)
        const response = await props[updatePropName](...args)
        props.setUpdating(false)

        return response
      } catch (err) {
        props.setUpdating(false)
        // catch should only process errors that
        // it knows and `rethrow` all others.
        throw err
      }
    }

    return acc
  }, {})

const withManualUpdating = ({ component, updatingStyle }: IUpdateOptions) =>
  compose(
    withState('isManualUpdating', 'setManualUpdating', false),
    withUpdating({
      component,
      updatingStyle,
      updatingName: 'isManualUpdating'
    })
  )

const withUpdatingCreator = ({
  updates,
  component,
  updatingStyle
}: IUpdateOptions) =>
  compose(
    withState('isUpdating', 'setUpdating', false),
    withProps(simulatePending(updates)),
    withUpdating({
      component,
      updatingStyle
    })
  )

export { withManualUpdating, withUpdatingCreator, IUpdateOptions }
