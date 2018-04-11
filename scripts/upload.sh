#!/bin/bash
remote=test.mindflow.pro
rm -f dist.tgz
ng build -prod  --aot false
tar czf dist.tgz dist
scp dist.tgz root@test.mindflow.pro:dist-upload.tgz
DIR=/home/nginx/test-site
ssh root@${remote} mv dist-upload.tgz $DIR && chown nginx:nginx $DIR/dist-upload.tgz
ssh root@${remote} sudo -u nginx tar -C $DIR -xzf $DIR/dist-upload.tgz
#ssh root@duimitech sudo chcon -t  httpd_sys_content_t  $DIR/dist
