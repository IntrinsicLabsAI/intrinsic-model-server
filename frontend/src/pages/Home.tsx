import { useGetModelsQuery } from '../api/services/v1';

import Callout from '../components/core/Callout';
import ModelCardView from '../components/ModelCardView';
import Page from '../components/layout/Page';
import OneColumnLayout from '../components/layout/OneColumnLayout';
import TwoColumnLayout from '../components/layout/TwoColumnLayout';
import Widget from '../components/core/Widget';
import Column from '../components/layout/Column';
import { featureUpdates } from '../data/featureUpdates';
import Card from '../components/core/Card';
import { Icon } from '@blueprintjs/core';

export default function Home() {
  // All models
  const { data, isLoading } = useGetModelsQuery()

  return (
    <>
      <Page>
        <OneColumnLayout>
          <Column>
            <Callout color="green">
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

                {(data?.models.length ?? 0) > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                    {(!isLoading && data) ? (
                      data.models.map((model) => (
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
            <Widget title="Feature Updates">
              <div>
                {featureUpdates.sort((a, b) => b.id - a.id).map((update) => (
                  <div className=" pb-2 " key={update.id}>
                    <Card>
                      <div className="flex flex-col w-full gap-1">
                        <h3 className=' text-lg font-medium '>{update.title}</h3>
                        <div className='flex flex-row gap-1.5 items-center'>
                          <Icon icon="time" size={14} color="#82BEC7" />
                          <p className=' text-sm font-medium leading-none text-blue-500'>{update.date.toDateString()}</p>
                        </div>
                        <p className=' pt-2 whitespace-pre-wrap '>{update.description}</p>
                      </div>
                    </Card>
                  </div>
                  ))}
              </div>
            </Widget>
          </Column>
        </TwoColumnLayout >
      </Page >
    </>
  )
}
