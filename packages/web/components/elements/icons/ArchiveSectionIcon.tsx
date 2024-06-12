/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class ArchiveSectionIcon extends React.Component<IconProps> {
  render() {
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width="23"
        height="23"
        viewBox="0 0 23 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M19.1667 3.18359H3.83341C2.77487 3.18359 1.91675 4.04171 1.91675 5.10026C1.91675 6.15881 2.77487 7.01693 3.83341 7.01693H19.1667C20.2253 7.01693 21.0834 6.15881 21.0834 5.10026C21.0834 4.04171 20.2253 3.18359 19.1667 3.18359Z"
            fill={color}
          />
          <path
            d="M18.2083 8.93359C18.6999 8.93359 19.1053 9.3773 19.1599 9.94943L19.1666 10.0836V16.9836C19.1666 18.8207 17.9696 20.3224 16.4603 20.4278L16.2916 20.4336H6.70825C5.17684 20.4336 3.92525 18.9971 3.83804 17.1868L3.83325 16.9836V10.0836C3.83325 9.44822 4.26259 8.93359 4.79159 8.93359H18.2083ZM13.4166 10.8503H9.58325L9.47113 10.857C9.2382 10.8847 9.02353 10.9968 8.86777 11.1722C8.71201 11.3476 8.62599 11.574 8.62599 11.8086C8.62599 12.0432 8.71201 12.2696 8.86777 12.445C9.02353 12.6203 9.2382 12.7325 9.47113 12.7602L9.58325 12.7669H13.4166L13.5287 12.7602C13.7616 12.7325 13.9763 12.6203 14.1321 12.445C14.2878 12.2696 14.3739 12.0432 14.3739 11.8086C14.3739 11.574 14.2878 11.3476 14.1321 11.1722C13.9763 10.9968 13.7616 10.8847 13.5287 10.857L13.4166 10.8503Z"
            fill={color}
          />
        </g>
      </svg>
    )
  }
}
