import { LatestBooks } from "../components/custom/latest-book"
import { Welcome } from "../components/custom/welcome"

export default function Home() {
  // const { user } = useDemo()
  // const isAdmin = user?.role?.toLowerCase() === 'admin'

  return (
    <>
      <Welcome />
      <LatestBooks />
    </>
  )
}
