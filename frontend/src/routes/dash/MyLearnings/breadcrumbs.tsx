
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import "./myLearning.css";
import { Link } from "react-router-dom";

export function MyLearningsBreadCrumbs() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
          <Link to="/">Home</Link>
            {/* <BreadcrumbLink href="/">Home</BreadcrumbLink> */}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {/* <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <BreadcrumbLink href="/mylearnings" >My Learnings</BreadcrumbLink>
          </BreadcrumbLink>
        </BreadcrumbItem> */}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="mycourses-heading" style={{ fontFamily: "Poppins", fontSize: "30px", color: "rgb(145, 248, 156)"}}>My Learnings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

