import { useGetModelsQuery } from './services/baseService'
import { CloudIcon } from '@heroicons/react/24/solid'

export default function App() {

  let { data, error, isLoading } = useGetModelsQuery()

  if (error) { console.log(error) }

  return (
    <div className="flex flex-col h-screen">
      <header>
        <div className='flex flex-row h-18 p-4 items-center border-b border-slate-400'>
          <CloudIcon className="h-8 w-8 text-blue-500 pr-2" />
          <p className="text-lg font-semibold">Model Server</p>
        </div>
      </header>
      <div className=' flex flex-col flex-grow bg-slate-100'>
        <div className=" my-10 bg-white w-2/3 h-full outline outline-1 outline-slate-400 self-center rounded-md ">
          <div className="flex flex-col h-full p-4">
            <div className="flex flex-row items-center">
              <h3 className="text-3xl font-semibold grow">Available Models</h3>
              <button type='submit' className=' bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded'>
                <p className='text-md font-medium'>Add Model</p>
              </button>
            </div>
            <div className="flex flex-row items-center w-full mt-2">
              <p className=' text-lg font-base text-slate-600 leading-tight mt-2'>
                The models listed below are currently active and available for use.
                To add a new model to the server, click the <span className=' italic '>Add Model</span> button above.
                Different versions of each model by indicating the version when invoking the model.
              </p>
            </div>
            <div className="flex flex-row items-center w-full mt-4">
              {(!isLoading && data) ? (
                <table className="table-fixed border w-full">
                  <thead className=' bg-blue-100'>
                    <tr>
                      <th className='font-bold p-2 border-b text-left'>Name</th>
                      <th className='font-bold p-2 border-b text-left'>Version</th>
                      <th className='font-bold p-2 border-b text-left'>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.models.map((model) => (
                      <tr key={model.name} className='hover:bg-stone-100 group'>
                        <td className="group-hover:font-semibold p-3 border-b text-left">{model.name}</td>
                        <td className="group-hover:font-semibold p-2 border-b text-left">{model.version}</td>
                        <td className="group-hover:font-semibold p-2 border-b text-left">
                          <div className="font-medium bg-indigo-300 rounded-md w-fit py-1 px-2 outline outline-indigo-400">
                            {model.model_type.toUpperCase()}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  )
};