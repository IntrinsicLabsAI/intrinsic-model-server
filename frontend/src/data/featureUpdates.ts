export const featureUpdates: Array<{ id: number, date: Date, title: string, description: string }> = [
    {
        id: 1,
        date: new Date("2023-06-30"),
        title: "Saved Experiments",
        description: "Experiments can now be saved in the App for future reference. These experiments will persist across sessions and can be deleted at any time."
    },
    {
        id: 2,
        date: new Date("2023-07-05"),
        title: "Model Settings Page + Delete",
        description: "Model settings have been consolidated to a new tab in the model page. In addition, the option to delete a model or model version has been added to the App and API."
    }
]