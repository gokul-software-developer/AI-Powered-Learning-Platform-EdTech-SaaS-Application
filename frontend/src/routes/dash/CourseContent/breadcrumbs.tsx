import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import "./courseContent.css"
import { Link } from "react-router-dom"

type CourseBreadCrumbsProps = {
  courseName: string
}

export function CourseBreadCrumbs({ courseName }: CourseBreadCrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link to="/">Home</Link>
          {/* <BreadcrumbLink href="/">Home</BreadcrumbLink> */}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Link to="/mylearnings">My Learning</Link>
          {/* <BreadcrumbLink href="/mylearnings">My Learnings</BreadcrumbLink> */}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage
            className="mycourses-heading"
            style={{ fontFamily: "Poppins", fontSize: "30px", color: "rgb(145, 248, 156" , lineHeight: "1.2" }}
          >
            {courseName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
