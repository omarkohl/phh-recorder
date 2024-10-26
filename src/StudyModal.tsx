import {useState} from 'react';
import {Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Input, Button} from "@headlessui/react";

const StudyModal = (
    props: Readonly<{
        isOpen: boolean,
        onClose: () => void,
        onSubmit: (answer: string) => void,
        answer: string
    }>
) => {
    const [answer, setAnswer] = useState(props.answer);
    const [prevAnswer, setPrevAnswer] = useState('');
    if (props.answer !== prevAnswer) {
        setAnswer(props.answer);
        setPrevAnswer(props.answer);
    }

    if (!props.isOpen) return null;

    const close = () => {
        props.onClose();
        setAnswer('');
    }

    return (
        <Dialog open={props.isOpen} onClose={close} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/30"/>
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 rounded-lg">
                    <DialogTitle className="font-bold text-lg">Answer</DialogTitle>
                    <Description className="text-sm text-gray-600">
                        Describe the correct action in this spot.
                        Leave it empty to default to the action actually taken.
                    </Description>
                    <Input
                        value={answer}
                        autoFocus
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Correct action"
                        className="w-full rounded-lg border-gray-300 p-2 text-sm text-black"
                    />
                    <div className="flex gap-4">
                        <Button
                            onClick={close}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                props.onSubmit(answer);
                                setAnswer('');
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        >
                            Save
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default StudyModal;
