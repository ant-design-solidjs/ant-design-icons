import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/es/types'
import type { Component, JSX } from 'solid-js'
import { generate, getSecondaryColor, isIconDefinition, useInsertStyles, warning } from '../utils'

export interface IconProps {
    icon: IconDefinition
    className?: string
    onClick?: JSX.EventHandler<SVGSVGElement, MouseEvent>
    style?: JSX.CSSProperties
    primaryColor?: string // only for two-tone
    secondaryColor?: string // only for two-tone
    focusable?: string
}

export interface TwoToneColorPaletteSetter {
    primaryColor: string
    secondaryColor?: string
}

export interface TwoToneColorPalette extends TwoToneColorPaletteSetter {
    calculated?: boolean // marker for calculation
}

const twoToneColorPalette: TwoToneColorPalette = {
    primaryColor: '#333',
    secondaryColor: '#E6E6E6',
    calculated: false,
}

function setTwoToneColors({ primaryColor, secondaryColor }: TwoToneColorPaletteSetter) {
    twoToneColorPalette.primaryColor = primaryColor
    twoToneColorPalette.secondaryColor = secondaryColor || getSecondaryColor(primaryColor)
    twoToneColorPalette.calculated = !!secondaryColor
}

function getTwoToneColors(): TwoToneColorPalette {
    return {
        ...twoToneColorPalette,
    }
}

interface IconBaseComponent<P> extends Component<P> {
    getTwoToneColors: typeof getTwoToneColors
    setTwoToneColors: typeof setTwoToneColors
}

const IconBase: IconBaseComponent<IconProps> = (props) => {
    const { icon, className, onClick, style, primaryColor, secondaryColor, ...restProps } = props

    let svgRef: HTMLElement = null

    let colors: TwoToneColorPalette = twoToneColorPalette
    if (primaryColor) {
        colors = {
            primaryColor,
            secondaryColor: secondaryColor || getSecondaryColor(primaryColor),
        }
    }

    useInsertStyles(svgRef)

    warning(isIconDefinition(icon), `icon should be icon definiton, but got ${icon}`)

    if (!isIconDefinition(icon)) {
        return null
    }

    let target = icon
    if (target && typeof target.icon === 'function') {
        target = {
            ...target,
            icon: target.icon(colors.primaryColor, colors.secondaryColor),
        }
    }
    return generate(target.icon as AbstractNode, `svg-${target.name}`, {
        className,
        onClick,
        style,
        'data-icon': target.name,
        'width': '1em',
        'height': '1em',
        'fill': 'currentColor',
        'aria-hidden': 'true',
        ...restProps,
        'ref': svgRef,
    })
}

IconBase.getTwoToneColors = getTwoToneColors
IconBase.setTwoToneColors = setTwoToneColors

export default IconBase
