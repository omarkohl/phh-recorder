import {useState} from 'react';
import {Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Input} from "@headlessui/react";

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
                <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
                    <DialogTitle className="font-bold">Answer</DialogTitle>
                    <Description>
                        Describe the correct action in this spot.
                        Leave it empty to default to the action actually taken.
                    </Description>
                    <Input
                        value={answer}
                        autoFocus
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Correct action"
                    />
                    <div className="flex gap-4">
                        <button onClick={close}>Cancel</button>
                        <button onClick={() => {
                            props.onSubmit(answer);
                            setAnswer('');
                        }}>
                            Save
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default StudyModal;
