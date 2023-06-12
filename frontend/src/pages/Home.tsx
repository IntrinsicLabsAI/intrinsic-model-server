import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import { useGetModelsQuery, useRegisterModelMutation, useDeleteModelMutation } from '../services/baseService'
import { GetRegisteredModelsResponse, ModelInfo, ModelType } from '../api'

import Section from '../components/core/Section'
import Callout from '../components/core/Callout'
import ModelCardView from '../components/ModelCardView'

interface distinctModel {
  name: string,
  maxVersion: string,
  versions: string[]
}

function RegisterModelForm({
  open,
  setOpen,
  registerHandler,
}: {
  open: boolean,
  setOpen: (toggle: boolean) => void,
  registerHandler: (arg: ModelInfo) => void,
}) {
  const cancelButtonRef = useRef(null);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [modelType, setModelType] = useState<ModelType>(ModelType.COMPLETION);
  const [modelPath, setModelPath] = useState<string>("");

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => setOpen(false)}>
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
                          placeholder='0.0.1'
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

export default function Home() {
  const [open, setOpen] = useState(false)

  // State for registering a new model
  const { data, error, isLoading } = useGetModelsQuery()

  // Mutations for registering and deleting models
  const [registerModelAction] = useRegisterModelMutation();
  const [deleteModelAction] = useDeleteModelMutation();

  const getAllModels = function (data: GetRegisteredModelsResponse): distinctModel[] {

    const distinctModelList = new Array<distinctModel>();

    if(!data) {return distinctModelList}

    for (const model of data.models) {
      let flag = true;
      distinctModelList.forEach((item, index) => {
        if (item.name == model.name) {
          flag = false;
          if (item.maxVersion < model.version) {
            const priorEntryVersions = distinctModelList[index].versions;
            priorEntryVersions.push(model.version)
            distinctModelList[index] = {
              name: model.name,
              maxVersion: model.version,
              versions: priorEntryVersions
            };
          }
        }
      })
      if (flag) {
        distinctModelList.push({
          name: model.name,
          maxVersion: model.version,
          versions: [model.version]
        });
      }
    }
    return distinctModelList;
  };

  let distinctModelList: distinctModel[] = [];

  if (error) { console.log(error) }
  if (!isLoading && data) {distinctModelList = getAllModels(data)}

  return (
    <>
      <RegisterModelForm open={open} setOpen={setOpen} registerHandler={(modelInfo) => {
        registerModelAction(modelInfo);
        setOpen(false)
      }}
      />

      <div className='mt-10 w-[80%] self-center'>
        <div className="flex flex-col gap-5 items-center">

          <Callout>
            <h3 className='text-lg font-semibold text-dark-500 leading-none'>Welcome to Intrinsic Model Server</h3>
            <p className='text-lg text-dark-500 leading-snug mt-2'>
              This project is under active development by members of <a href="https://intrinsiclabs.ai" target="_blank" className='underline underline-offset-2'>Intrinsic Labs</a>.
              If you have any issues or ideas, add them as issues to the <a href="https://github.com/IntrinsicLabsAI/intrinsic-model-server" target="_blank" className='underline underline-offset-2'>GitHub repository</a>.
              A roadmap for this project is available in the GitHub repository.
            </p>
          </Callout>

          <div className='flex flex-row w-full gap-5'>

            <Section>
              <div className="flex flex-col h-full">
                <h3 className="text-3xl font-semibold grow text-white/90">Registered Models</h3>
                <div className="flex flex-row items-center w-full mt-2">
                  <p className=' text-lg font-base text-slate-600 leading-tight mt-2 text-white/70'>
                    The models listed below are currently active and available for use.
                    Different versions of each model can be used by indicating the version when invoking the model.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full mt-8 mx-auto">
                  {(!isLoading && data) ? (
                    distinctModelList.map((model) => (
                      <div key={model.name} className=" w-full ">
                        <ModelCardView 
                          modelName={model.name}
                          modelVersions={data.models.filter((modelVersion) => modelVersion.name == model.name)}
                          deleteHandler={(guid) => { deleteModelAction(guid) }}
                          />
                      </div>
                    ))) : ( 
                      null 
                    )}
                </div>
              </div>
            </Section>

            <div className=' flex flex-col w-80 gap-5'>
              <div className='grow-0'>
                <Section>
                  <div className='flex flex-col items-center'>
                    <p className=' text-white font-semibold '>Server Status</p>
                    {(!error) ? (
                      <p className=' text-lg font-bold text-primary-600'>Online</p>
                    ) : (
                      <p className=' text-lg font-bold text-white'>Offline</p>
                    )}
                  </div>
                </Section>
              </div>

              <div className='grow-0'>
                <Section>
                  <div className='flex flex-col items-center'>
                    <p className=' text-white font-semibold'>Quick Actions</p>
                    <button
                      type='button'
                      onClick={() => setOpen(true)}
                      className=' hover:text-primary-400 rounded pt-2'>
                      <p className=' text-base text-white'>Register Model</p>
                    </button>
                  </div>
                </Section>
              </div>

            </div>
          </div>
        </div>
      </div>

    </>
  )
}
