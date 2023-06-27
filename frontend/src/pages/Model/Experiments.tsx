import InferenceExploration from "../../components/InferenceExploration"
import OneColumnLayout from "../../components/layout/OneColumnLayout"
import Column from "../../components/layout/Column"

import { useParams } from "react-router-dom";

export default function Experiments() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    return (
        <OneColumnLayout>
            <Column>
                <InferenceExploration model={modelName} />
            </Column>
        </OneColumnLayout>
    )
}