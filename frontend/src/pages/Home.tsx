import { useEffect, useState } from 'react'

import { useGetModelsQuery } from '../api/services/baseService'
import { GetRegisteredModelsResponse } from '../api'

import Callout from '../components/core/Callout'
import ModelCardView from '../components/ModelCardView'
import Page from '../components/layout/Page'
import OneColumnLayout from '../components/layout/OneColumnLayout'
import TwoColumnLayout from '../components/layout/TwoColumnLayout'
import Widget from '../components/core/Widget'
import Column from '../components/layout/Column'
import { Status, StatusChecker } from "../api/services/statusService";

interface distinctModel {
  name: string,
  maxVersion: string,
  versions: string[]
}

export default function Home() {
  // State for registering a new model
  const { data, error, isLoading } = useGetModelsQuery()

  const getAllModels = function (data: GetRegisteredModelsResponse): distinctModel[] {

    const distinctModelList = new Array<distinctModel>();

    if (!data) { return distinctModelList }

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

  // Setup status checker in background.
  const [onlineState, setOnlineState] = useState<Status>("loading");
  useEffect(() => {
    // Create and mount a status checker on the beginning of page load.
    const checker = new StatusChecker(setOnlineState);
    checker.start();
    return () => {
      checker.stop();
    };
  }, []);

  let distinctModelList: distinctModel[] = [];

  if (error) { console.log(error) }
  if (!isLoading && data) { distinctModelList = getAllModels(data) }

  return (
    <>
      <Page>
        <OneColumnLayout>
          <Column>
            <Callout>
              <h3 className='text-lg font-semibold text-dark-500 leading-none'>Welcome to Intrinsic Model Server</h3>
              <p className='text-lg text-dark-500 leading-snug mt-2'>
                This project is under active development by members of <a href="https://intrinsiclabs.ai" target="_blank" className='underline underline-offset-2'>Intrinsic Labs</a>.
                If you have any issues or ideas, add them as issues to the <a href="https://github.com/IntrinsicLabsAI/intrinsic-model-server" target="_blank" className='underline underline-offset-2'>GitHub repository</a>.
                A roadmap for this project is available in the GitHub repository.
              </p>
            </Callout>
          </Column>
        </OneColumnLayout>

        <TwoColumnLayout type="left">
          <Column>
            <Widget title="Registered Models">
              <div className="flex flex-col h-full">
                <div className="flex flex-row items-center w-full">
                  <p className=' text-lg font-base leading-tight text-gray-200'>
                    The models listed below are currently active and available for use.
                    Different versions of each model can be used by indicating the version when invoking the model.
                    You can register new models here or via API.
                    For information how how to use the API, view the included <a className='underline underline-offset-2' href="http://127.0.0.1:8000/docs">documentation</a>.
                  </p>
                </div>

                <div className="flex flex-row items-center w-full mt-4">
                  <h3 className=' text-xl font-semibold'>Completion Models</h3>
                </div>

                {distinctModelList.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                    {(!isLoading && data) ? (
                      distinctModelList.map((model) => (
                        <div key={model.name} className=" w-full ">
                          <ModelCardView
                            modelName={model.name}
                          />
                        </div>
                      ))) : (
                      null
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className=''>
                      No models were found.
                      This could be because no models have been registered or the server is offline.
                      To get started, please register a model.
                    </p>
                  </div>
                )}

              </div>
            </Widget>
          </Column>

          <Column>
            <Widget title="Server Status">
              <div className='flex flex-col items-center'>
                <p className=' text-white font-semibold '>Current Status</p>
                {
                  onlineState === "loading" && (
                    <div className='flex flex-row items-center gap-2'>
                      <div className="w-4 h-4 bg-amber-600 rounded-full"></div>
                      <p className=' text-lg font-bold text-amber-400'>Connecting</p>
                    </div>
                  )
                }
                {onlineState === "online" && (
                  <div className='flex flex-row items-center gap-2'>
                    <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
                    <p className=' text-lg font-bold text-primary-400'>Online</p>
                  </div>
                )}
                {onlineState === "offline" && (
                  <div className='flex flex-row items-center gap-2'>
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <p className=' text-lg font-bold text-red-600'>Offline</p>
                  </div>
                )}
              </div>
            </Widget>
          </Column>
        </TwoColumnLayout >
      </Page >
    </>
  )
}
