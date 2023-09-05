import InferenceExploration from "../../components/InferenceExploration";
import OneColumnLayout from "../../components/layout/OneColumnLayout";
import Column from "../../components/layout/Column";

import { useGetModelsQuery } from "../../api/services/v1";
import { useParams } from "react-router-dom";

export default function Experiments() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const { registeredModel } = useGetModelsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            registeredModel: data?.models.find((m) => m.name === modelName),
        }),
    });

    return (
        <OneColumnLayout>
            <Column>{registeredModel && <InferenceExploration model={registeredModel} />}</Column>
        </OneColumnLayout>
    );
}
