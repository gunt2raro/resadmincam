app
    .factory( 'AreaTypeRepository', [ '$http', function( $http ) {
        return({
            getAll : function(  ) {
                return $http({
                    url : '/areatype',
                    method : 'GET'
                });
            },
            add : function( data ) {
                var jsonData = JSON.stringify( data );
                return $http({
                    url : '/areatype',
                    method : 'POST',
                    data : jsonData
                });
            },
            getById : function( id ) {
                return $http({
                    url : '/areatype/' + id,
                    method : 'GET'
                });
            },
            update : function( data ) {
                var jsonData = JSON.stringify(data);
                return $http({
                    url : '/areatype/' + data.id,
                    method : 'PUT',
                    data : jsonData
                });
            },
            remove : function( id ) {
                return $http({
                    url : '/areatype/' + id,
                    method : 'DELETE'
                });
            },
            validateData : function( data, scope ) {
                var ban = false;
                scope.errors = "";
                if( data.name.length > 1 && data.name.length < 100 ) {
                    ban = true;
                } else {
                    ban = false;
                    scope.errors += "Por favor escriba un nombre válido. \n";
                }
                if( data.description.length > 1 && data.description.length < 200 ) {
                    ban = true;
                } else {
                    ban = false;
                    scope.errors += "Por favor escriba una descripción válida. \n";
                }
                if( data.max_guests > 0 ) {
                    ban = true;
                } else {
                    ban = false;
                    scope.errors += "Por favor agregué un Máximo válido. \n";
                }
                return ban;
            }
        });
    }])
    .controller( 'areatype-controller', [ '$scope', '$rootScope', '$location', '$routeParams', '$mdDialog', 'AreaTypeRepository', function( $scope, $rootScope, $location, $routeParams, $mdDialog, AreaTypeRepository ) {

        $scope.title = "Tipo de área";

        var allAreaTypes = function() {
            AreaTypeRepository.getAll().success( function( data ) {
                if (!data.error) {
                    var the_data = data.data;
                    $scope.areatypes = the_data.data;
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                console.log( error );
            });
        };

        if( $routeParams.id ) {

            AreaTypeRepository.getById( $routeParams.id ).success( function( data ) {
                if( !data.error ) {
                    $scope.areatype = data.data;
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });

            $scope.update = function() {
                if( AreaTypeRepository.validateData( $scope.areatype, $scope ) ) {
                    AreaTypeRepository.update( $scope.areatype ).success( function( data ) {
                        if( !data.error ) {
                            $scope.areatype = data.data;
                            $location.path( '/areatypes/detail/' + $scope.areatype.id );
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }
            };

        } else {

            allAreaTypes();

            $scope.areatype = {
                name : "",
                description : "",
                max_guests : 0
            };
            
            $scope.add = function() {

                if( AreaTypeRepository.validateData( $scope.areatype, $scope ) ) {
                    AreaTypeRepository.add( $scope.areatype ).success( function( data ) {
                        if( !data.error ) {
                            $location.path( "/areatypes" );
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }

            };

            $scope.searchChange = function() {
                console.log( $scope.search_text );
            };
        }

        $scope.delete = function( e, id ){

            var confirm = $mdDialog.confirm()
                .title('¿Desea borrar el registro?')
                .textContent("Después de borrar esto no podrá ser recuperado.")
                .ariaLabel('Lucky day')
                .targetEvent(e)
                .ok('Borrar Tipo de Área')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                AreaTypeRepository.remove( id ).success( function( data ) {
                    if( !data.error ) {
                        allAreaTypes();
                        $location.path( "/areatypes" );
                    } else {
                        $scope.errors = data.message;
                    }
                }).error( function(error) {
                    $scope.errors =  "Ha habido un error.";
                });
            }, null );
        };

    }]);