import { Input, Button } from "@/components/ui/index"
import { useState } from "react"
import { Eye, EyeClosed } from "lucide-react"

type InputPasswordProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string
};

export default function InputPassword({ id, className, ...props }: InputPasswordProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Input id={id} type={show ? "text" : "password"} autoComplete="off" required className="pr-10" {...props}/>
            <Button type="button" variant="ghost" size="icon" onClick={() => setShow(!show)} className="absolute right-0 top-0 h-full px-3 hover:bg-transparent">
                {show ? <EyeClosed /> : <Eye/>}
            </Button>
        </div>
    );
}