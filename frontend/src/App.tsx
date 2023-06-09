import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import { useGetModelsQuery, useRegisterModelMutation, useDeleteModelMutation } from './services/baseService'
import { CloudIcon, BookOpenIcon } from '@heroicons/react/24/solid'
import { ModelInfo, ModelType } from './api'

import Card from './components/Card'

function RegisterModelForm({
  open,
  registerHandler,
}: {
  open: boolean,
  registerHandler: (arg: ModelInfo) => void,
}) {
  const cancelButtonRef = useRef(null);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [modelType, setModelType] = useState<ModelType>(ModelType.COMPLETION);
  const [modelPath, setModelPath] = useState<string>("");

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => { console.log("Closed modal without doing anything") }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Register New Model
                    </Dialog.Title>
                    <div className="mt-2 mb-4">
                      <p className="text-sm text-gray-500">
                        Please enter information about the model you would like to register with the server.
                        Once registered, this model will be available for use by all clients via API.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="w-48 mx-auto rounded" />

                <form className='sm:mt-4'>
                  <div className="sm:col-span-4">
                    <div className='mb-2'>
                      <label htmlFor="modelname" className="block text-sm font-medium leading-6 text-gray-900">
                        Model Name
                      </label>

                      <div className="flex rounded-md ring-1 ring-inset ring-gray-300 sm:max-w-md">
                        <input
                          type="text"
                          name="modelname"
                          value={name}
                          onChange={(evt) => setName(evt.target.value)}
                          className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="Your cutting edge model..."
                        />
                      </div>
                    </div>

                    <div className='mb-2'>
                      <label htmlFor="modelname" className="block text-sm font-medium leading-6 text-gray-900">
                        Model Version (optional)
                      </label>

                      <div className="flex rounded-md ring-1 ring-inset ring-gray-300 sm:max-w-md">
                        <input
                          type="text"
                          value={version}
                          onChange={(evt) => setVersion(evt.target.value)}
                          className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className='mb-2'>
                      <label htmlFor="modelType" className="block text-sm font-medium leading-6 text-gray-900">
                        Model Type
                      </label>

                      <div className='flex sm:max-w-md'>
                        <select
                          id="modelType"
                          name="modelType"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300"
                          onChange={(evt) => setModelType(evt.target.value as ModelType)}
                        >
                          <option>completion</option>
                        </select>
                      </div>
                    </div>

                    <div className='mb-2'>
                      <label htmlFor="modelPath" className="block text-sm font-medium leading-6 text-gray-900">
                        Model Path
                      </label>

                      <div className="flex rounded-md ring-1 ring-inset ring-gray-300 sm:max-w-md">
                        <input
                          type="text"
                          value={modelPath}
                          onChange={(evt) => setModelPath(evt.target.value)}
                          className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="Local / Path / To / Model"
                        />
                      </div>
                    </div>

                  </div>
                </form>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                    // disabled={!!name || !!modelPath || !!modelType}
                    onClick={() => {
                      registerHandler({
                        name: name,
                        version: version || undefined,
                        model_type: modelType,
                        model_params: {
                          model_path: modelPath,
                        }
                      })
                    }}>
                    Register
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default function App() {
  const [open, setOpen] = useState(false)

  // State for registering a new model
  const { data, error, isLoading } = useGetModelsQuery()

  // Mutations for registering and deleting models
  const [registerModelAction] = useRegisterModelMutation();
  const [deleteModelAction] = useDeleteModelMutation();

  if (error) { console.log(error) }

  return (
    <div className="flex flex-col h-screen">
      <header>
        <div className='flex flex-row h-18 p-4 items-center border-b border-slate-400'>
          <CloudIcon className="h-8 w-8 text-blue-500 pr-2" />
          <p className="text-lg font-semibold">Model Server</p>
          <a aria-label="View Server API Documentatio." className='ml-auto' href='http://127.0.0.1:8000/docs' rel="noopener" target="_blank">
            <BookOpenIcon className="h-8 w-8 text-black pr-2" />
          </a>
        </div>
      </header>

      <RegisterModelForm open={open} registerHandler={(modelInfo) => {
        registerModelAction(modelInfo);
        setOpen(false)}} 
      />

      <div className=' flex flex-col flex-grow bg-slate-100'>
        <div className=" my-10 bg-white w-2/3 h-full outline outline-1 outline-slate-400 self-center rounded-md ">
          <div className="flex flex-col h-full p-10">
            <div className="flex flex-row items-center">
              <h3 className="text-3xl font-semibold grow">Available Models</h3>
              <button
                type='button'
                onClick={() => setOpen(true)}
                className=' bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded'>
                <p className=' text-base font-normal'>Register</p>
              </button>
            </div>
            <div className="flex flex-row items-center w-full mt-2">
              <p className=' text-lg font-base text-slate-600 leading-tight mt-2'>
                The models listed below are currently active and available for use.
                Different versions of each model can be used by indicating the version when invoking the model.
              </p>
            </div>
            <div className="flex flex-row w-full mt-8 mx-auto">
              {(!isLoading && data) ? (
                <div className=' grid grid-cols-1 lg:grid-cols-3 gap-4 w-full'>
                  {data?.models.map((model) => (
                    <Card
                      title={model.name}
                      version={model.version}
                      guid={model.guid}
                      deleteHandler={(guid) => { deleteModelAction(guid) }}
                    />
                  ))}
                </div>
              ) : (
                <p className=' text-lg font-mono '>
                  Attempting to connect to your server to load information about available models.
                  Please confirm that the model server is running and accessible from this client.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
