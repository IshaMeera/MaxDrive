import { Button } from "@/components/ui/button";


function TestComponent(){
    return(
        <div className="p-6 bg-white rounded-xl shadow-md text-black text-center space-y-4">
      <h2 className="text-xl font-semibold">This is a Test Component</h2>
      <Button variant="default">Click Me</Button>
    </div>
    )
}

export default TestComponent;