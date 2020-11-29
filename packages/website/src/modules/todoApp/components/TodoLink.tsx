import { ReactChild } from 'react'

export interface Props {
  active: boolean
  children: ReactChild
  onClick: () => void
}

const Link = ({ active, children, onClick }: Props) =>
  active ? <span>{children}</span> : <ma-button onClick={onClick}>{children}</ma-button>

export default Link
