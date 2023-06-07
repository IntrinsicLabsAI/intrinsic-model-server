import { useGetModelsQuery } from './services/baseService'

export default function App() {

  let { data, error, isLoading } = useGetModelsQuery('')
  if(error) console.log(error)
  if(!isLoading && data) console.log(data)

  return (
    <>
      <p className="text-3xl font-bold text-center mt-6">Intrinsic Model Server</p>
      
    </>
  )
};