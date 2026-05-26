import CreateTest from "@/components/test/create-test"
import ListTests from "@/components/test/list-tests"

const Rooms = () => {
  return (
    <div className="w-full p-4">
      <main className="flex justify-start md:justify-between items-start md:items-center flex-col md:flex-row gap-4 flex-wrap">
          <main className="flex flex-col gap-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Test Rooms
              </h1>
              <p className="text-muted-foreground text-sm font-light tracking-tight leading-tight">
                Make your own tests in your own chosen difficulties for making your preparation better
              </p>
          </main>

          <CreateTest />
      </main>

      <main>
        <ListTests />
      </main>
  </div>
  )
}

export default Rooms