app
    .factory( 'PoolRepository', [ '$http', function( $http ) {
        return({
            getAll : function(  ) {
                return $http({
                    url : '/pool',
                    method : 'GET'
                });
            },
            add : function( data ) {
                var jsonData = JSON.stringify( data );
                return $http({
                    url : '/pool',
                    method : 'POST',
                    data : jsonData
                });
            },
            getById : function( id ) {
                return $http({
                    url : '/pool/' + id,
                    method : 'GET'
                });
            },
            update : function( data ) {
                var jsonData = JSON.stringify(data);
                return $http({
                    url : '/pool/' + data.id,
                    method : 'PUT',
                    data : jsonData
                });
            },
            remove : function( id ) {
                return $http({
                    url : '/pool/' + id,
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
                    scope.errors += "Escriba un nombre válido. \n";
                }
                if( data.description.length > 1 && data.description.length < 500 ) {
                    ban = true;
                } else {
                    ban = false;
                    scope.errors += "Escriba una descripción válida. \n";
                }
                if( data.max_people > 0 ) {
                    ban = true;
                } else {
                    ban = false;
                    scope.errors += "Agregué Máximo válido. \n";
                }
                if( data.price > 0 ) {
                    ban = true;
                } else {
                    ban = false;
                    scope.errors += "Seleccione un precio válido. \n";
                }
                return ban;
            }
        });
    }])
    .controller( 'pool-controller', [ '$scope', '$rootScope', '$location', '$routeParams', '$mdDialog', 'PoolRepository', function( $scope, $rootScope, $location, $routeParams, $mdDialog, PoolRepository ) {

        $scope.title = "Albercas";

        var allPools = function() {
            PoolRepository.getAll().success( function( data ) {
                if (!data.error) {
                    var the_data = data.data;
                    $scope.pools = the_data.data;
                } else {
                    $scope.errors = data.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });
        };

        if( $routeParams.id ) {

            PoolRepository.getById( $routeParams.id ).success( function( data ) {
                if( !data.error ) {
                    $scope.pool = data.data;
                    $scope.pool.price = parseFloat( $scope.pool.price );
                    $scope.pool.max_people = parseInt( $scope.pool.max_people );
                } else {
                    $scope.errors = ddata.message;
                }
            }).error( function( error ) {
                $scope.errors = error;
            });

            $scope.update = function() {

                if( PoolRepository.validateData( $scope.pool, $scope ) ) {
                    PoolRepository.update( $scope.pool ).success( function( data ) {
                        if( !data.error ) {
                            $scope.pool = data.data;
                            $location.path( '/pools/detail/' + $scope.pool.id );
                        } else {
                            $scope.errors = data.message;
                        }
                    }).error( function( error ) {
                        $scope.errors = error;
                    });
                }
            };

        } else {

            allPools();

            $scope.pool = {
                name : "",
                description : "",
                price : 0,
                max_people : 0
            };

            $scope.add = function() {

                if( PoolRepository.validateData( $scope.pool, $scope ) ) {
                    PoolRepository.add( $scope.pool ).success( function( data ) {
                        if( !data.error ) {
                            $location.path( "/pools" );
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
                .ok('Borrar Alberca')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                CabinRepository.remove( id ).success( function( data ) {
                    if( !data.error ) {
                        allCabins();
                        $location.path( "/pools" );
                    } else {
                        $scope.errors = data.message;
                    }
                }).error( function(error) {
                    $scope.errors =  "Ha habido un error.";
                });
            }, null );
        };

    }]);