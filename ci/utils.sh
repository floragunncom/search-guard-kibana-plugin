start_collapsed_section() {
   echo -e "\e[0Ksection_start:`date +%s`:$1[collapsed=true]\r\e[0K\033[1;36m$2\033[0m"
}

start_section() {
   echo -e "\e[0Ksection_start:`date +%s`:$1\r\e[0K\033[1;36m$2\033[0m"
}

end_section() {
    echo -e "\e[0Ksection_end:`date +%s`:$1\r\e[0K"
}