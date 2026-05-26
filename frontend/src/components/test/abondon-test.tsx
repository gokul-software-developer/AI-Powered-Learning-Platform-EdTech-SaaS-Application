import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'

const AbondonTest = () => {
  return (
    <Drawer>
        <DrawerTrigger>
            <Button variant={"destructive"} size={"sm"}>
                <Plus className="rotate-45" />
            </Button>
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>
                    Abondon Test
                </DrawerTitle>
                <DrawerDescription>
                    Are you sure you want to abandon this test?, you will this quiz..
                </DrawerDescription>
            </DrawerHeader>

            <DrawerFooter>
                <DrawerClose asChild>
                    <Button variant={"outline"} size={"sm"}>
                        Cancel
                    </Button>
                </DrawerClose>
                <Button variant={"destructive"} size={"sm"}>
                    Abondon test
                    </Button>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
  )
}

export default AbondonTest